import React, { useEffect, useState } from 'react';
import { InfoCard } from '@backstage/core-components';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';
import { openFeedbackBackendRef } from '../../api/types';
import {
  Grid,
  Box,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import Rating from '@mui/material/Rating';
import DeleteIcon from '@mui/icons-material/Delete';
import Skeleton from '@mui/material/Skeleton';
import {
  AppFeedback,
  openFeedbackPageDeletePermission,
} from '@parsifal-m/backstage-plugin-open-feedback-common';
import { usePermission } from '@backstage/plugin-permission-react';

export const FeedbackCards = () => {
  const [feedback, setFeedback] = useState<AppFeedback[] | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const feedbackApi = useApi(openFeedbackBackendRef);
  const alertApi = useApi(alertApiRef);
  const { allowed } = usePermission({
    permission: openFeedbackPageDeletePermission,
  });

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const feedbackData = await feedbackApi.getFeedback();
        setFeedback(feedbackData);
      } catch (error) {
        alertApi.post({
          message: `Failed to fetch feedback: ${error}`,
          severity: 'error',
        });
      }
      setLoading(false);
    };

    fetchFeedback();
  }, [feedbackApi, alertApi]);

  const getRatingEmoji = (rating: number) => {
    if (rating === 5) return '🤩';
    if (rating >= 4) return '😃';
    if (rating >= 3) return '😊';
    if (rating >= 2) return '😐';
    return '😞';
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={6} key={index}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const handleDelete = async () => {
    if (deleteId === null) return;

    try {
      await feedbackApi.removeFeedback(deleteId);
      if (feedback) {
        setFeedback(feedback.filter(item => item.id !== deleteId));
      }
    } catch (error) {
      alertApi.post({
        message: `Failed to delete feedback: ${error}`,
        severity: 'error',
      });
    }

    setDeleteDialogOpen(false);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      {feedback?.map(item => (
        <Grid item xs={6} key={item.id}>
          <Box>
            <InfoCard
              title={`${item.userRef} ${getRatingEmoji(item.rating)}`}
              action={
                <IconButton
                  data-testid="delete-feedback-button"
                  onClick={() => handleDeleteClick(item.id)}
                  disabled={!allowed}
                  aria-label="delete"
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <Typography variant="body1">{item.comment}</Typography>
              <Box pt={2}>
                <Typography variant="body1">
                  <Rating name="read-only" value={item.rating} readOnly />
                </Typography>
              </Box>
            </InfoCard>
          </Box>
        </Grid>
      ))}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this feedback?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="primary" variant="outlined">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
