import React, { useEffect, useState } from 'react';
import { SubmitFeedback } from '@parsifal-m/backstage-plugin-open-feedback-common';
import { SidebarItem } from '@backstage/core-components';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import {
  useApi,
  identityApiRef,
  IconComponent
} from '@backstage/core-plugin-api';
import Rating from '@mui/material/Rating';
import { openFeedbackBackendRef } from '../../api/types';
import useAsyncFn from 'react-use/esm/useAsyncFn';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  DialogActions,
  Fab,
} from '@material-ui/core';

export type ButtonOpenfeedbackProps = {
  icon?: IconComponent;
  floating?: boolean;
  style?: React.CSSProperties;
};

export const OpenFeedbackModal = (props: ButtonOpenfeedbackProps) => {
  const [rating, setRating] = useState<number | null>(2);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(window.location.href);
  const feedbackApi = useApi(openFeedbackBackendRef);
  const identity = useApi(identityApiRef);
  const Icon = props.icon ? props.icon : ThumbUpAltIcon;
  const Floating = props.floating ?? false;
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
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const feedback: SubmitFeedback = {
      rating: rating ?? 0,
      url: url ?? '',
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

  useEffect(() => {
    if (open) {
      setUrl(window.location.href);
    }
  }, [open]);

  return (
    <>
      {!Floating ? (
        <SidebarItem
          icon={Icon}
          text="OpenFeedback"
          onClick={() => setOpen(true)}
        />
      ) : (
        <Fab color="primary" variant="extended" onClick={() => setOpen(true)} style={props.style}>
          <Icon style={{ marginRight: 4 }} />
            Feedback
        </Fab>
      )}      
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
            <Box mb={2} display="flex" alignItems="center">
              <TextField
                name="url"
                label="Location"
                value={url}
                onChange={event => setUrl(event.target.value)}
                fullWidth
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
            <DialogActions>
              <Button onClick={handleClose} variant="contained" color="primary">
                Close
              </Button>
              <Button type="submit" variant="outlined" color="primary">
                Submit
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
