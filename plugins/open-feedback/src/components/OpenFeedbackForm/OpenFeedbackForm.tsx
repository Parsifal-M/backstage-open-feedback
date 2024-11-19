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
import { SubmitFeedback } from '@parsifal-m/backstage-plugin-open-feedback-common';

export const FeedbackForm = () => {
  const [rating, setRating] = useState<number | null>(2);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const feedbackApi = useApi(openFeedbackBackendRef);
  const identity = useApi(identityApiRef);

  const [userName, fetchUserName] = useAsyncFn(async () => {
    return (await identity.getBackstageIdentity()).userEntityRef;
  });

  useEffect(() => {
    fetchUserName();
  }, [fetchUserName]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const feedback: SubmitFeedback = {
      rating: rating ?? 0,
      url: window.location.href,
      comment: comment,
      userRef: anonymous ? 'anonymous' : userName.value ?? 'anonymous',
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
          <TextField
            label="URL"
            value={window.location.href}
            disabled
            fullWidth
          />
        </Box>
        <Box mb={2}>
          <Rating
            name="rating"
            value={rating}
            onChange={(_, newValue) => {
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
            multiline
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
