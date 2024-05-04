import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';
import Rating from '@mui/material/Rating';
import React, { useEffect, useState } from 'react';
import { openFeedbackBackendRef } from '../../api/types';
import useAsyncFn from 'react-use/esm/useAsyncFn';
import { InfoCard } from '@backstage/core-components';
import { AppFeedback } from '@internal/backstage-plugin-open-feedback-common';

export const FeedbackForm = () => {
  const [rating, setRating] = useState<number | null>(2);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const feedbackApi = useApi(openFeedbackBackendRef);
  const identity = useApi(identityApiRef);

  const [userName, fetchUserName] = useAsyncFn(async () => {
    return await (
      await identity.getProfileInfo()
    ).displayName;
  });

  useEffect(() => {
    fetchUserName();
  }, [fetchUserName]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const feedback: AppFeedback = {
      rating: rating ?? 0,
      comment: comment,
      userRef: anonymous ? 'Anonymous' : userName.value ?? 'unknown',
    };

    await feedbackApi.submitFeedback(feedback);

    // reset form
    setRating(2);
    setComment('');
    setAnonymous(false);
  };

  return (
    <InfoCard title="Submit Feedback">
      <form onSubmit={handleSubmit}>
        <Box mb={2}>
          <Rating
            name="rating"
            value={rating}
            onChange={(event, newValue) => {
              if (newValue !== null) {
                setRating(newValue);
              }
            }}
          />
        </Box>
        <Box mb={2}>
          <TextField
            name="comment"
            label="Comment"
            value={comment}
            onChange={event => setComment(event.target.value)}
            fullWidth
          />
        </Box>
        <Box mb={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={anonymous}
                onChange={event => setAnonymous(event.target.checked)}
                name="anonymous"
                color="primary"
              />
            }
            label="Submit anonymously"
          />
        </Box>
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>
    </InfoCard>
  );
};
