import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';
import Rating from '@mui/material/Rating';
import React, { useEffect, useState } from 'react';
import { openFeedbackBackendRef } from '../../api/types';
import useAsyncFn from 'react-use/esm/useAsyncFn';
import { useNavigate } from 'react-router-dom';
import { AppFeedback } from '@internal/backstage-plugin-open-feedback-common';

export const OpenFeedbackModal = () => {
  const [rating, setRating] = useState<number | null>(2);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [open, setOpen] = useState(true);
  const feedbackApi = useApi(openFeedbackBackendRef);
  const identity = useApi(identityApiRef);
  const navigate = useNavigate();

  const [userName, fetchUserName] = useAsyncFn(async () => {
    return await (
      await identity.getProfileInfo()
    ).displayName;
  });

  useEffect(() => {
    fetchUserName();
  }, [fetchUserName]);

  const handleClose = () => {
    setOpen(false);
    navigate('/');
  };

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
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Submit Feedback</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
