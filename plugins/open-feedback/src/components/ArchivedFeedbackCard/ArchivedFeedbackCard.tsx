import { useEffect, useState } from 'react';
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
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import Skeleton from '@mui/material/Skeleton';
import {
  AppFeedback,
  openFeedbackPageDeletePermission,
  openFeedbackArchivePermission,
} from '@parsifal-m/backstage-plugin-open-feedback-common';
import { usePermission } from '@backstage/plugin-permission-react';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { getRatingEmoji, formatDateAndTime } from '../OpenFeedbackCard/OpenFeedbackCard';

export interface ArchivedFeedbackCardsProps {
  refreshKey?: number;
}

export const ArchivedFeedbackCards = ({
  refreshKey,
}: ArchivedFeedbackCardsProps) => {
  const [feedback, setFeedback] = useState<AppFeedback[] | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const feedbackApi = useApi(openFeedbackBackendRef);
  const alertApi = useApi(alertApiRef);
  const { allowed: deleteAllowed } = usePermission({
    permission: openFeedbackPageDeletePermission,
  });
  const { allowed: restoreAllowed } = usePermission({
    permission: openFeedbackArchivePermission,
  });

  useEffect(() => {
    const fetchArchivedFeedback = async () => {
      setLoading(true);
      try {
        const feedbackData = await feedbackApi.getArchivedFeedback();
        setFeedback(feedbackData);
      } catch (error) {
        alertApi.post({
          message: `Failed to fetch archived feedback: ${error}`,
          severity: 'error',
        });
      }
      setLoading(false);
    };

    fetchArchivedFeedback();
  }, [feedbackApi, alertApi, refreshKey]);

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
    if (actionId === null) return;

    try {
      await feedbackApi.removeFeedback(actionId);
      if (feedback) {
        setFeedback(feedback.filter(item => item.id !== actionId));
      }
    } catch (error) {
      alertApi.post({
        message: `Failed to delete feedback: ${error}`,
        severity: 'error',
      });
    }

    setDeleteDialogOpen(false);
  };

  const handleRestore = async () => {
    if (actionId === null) return;

    try {
      await feedbackApi.restoreFeedback(actionId);
      if (feedback) {
        setFeedback(feedback.filter(item => item.id !== actionId));
      }
    } catch (error) {
      alertApi.post({
        message: `Failed to restore feedback: ${error}`,
        severity: 'error',
      });
    }

    setRestoreDialogOpen(false);
  };

  const handleDeleteClick = (id: number) => {
    setActionId(id);
    setDeleteDialogOpen(true);
  };

  const handleRestoreClick = (id: number) => {
    setActionId(id);
    setRestoreDialogOpen(true);
  };

  if (!feedback || feedback.length === 0) {
    return (
      <Grid item xs={12}>
        <Typography variant="body1" color="textSecondary">
          No archived feedback found.
        </Typography>
      </Grid>
    );
  }

  return (
    <>
      {feedback.map(item => (
        <Grid item xs={6} key={item.id}>
          <Box>
            <InfoCard
              title={
                <>
                  {item.userRef && item.userRef !== 'anonymous' ? (
                    <EntityRefLink entityRef={item.userRef} />
                  ) : (
                    'Anonymous'
                  )}{' '}
                  {getRatingEmoji(item.rating)}
                </>
              }
              action={
                <Box display="flex">
                  <IconButton
                    data-testid="restore-feedback-button"
                    onClick={() => handleRestoreClick(item.id)}
                    disabled={!restoreAllowed}
                    aria-label="restore"
                  >
                    <UnarchiveIcon />
                  </IconButton>
                  <IconButton
                    data-testid="delete-archived-feedback-button"
                    onClick={() => handleDeleteClick(item.id)}
                    disabled={!deleteAllowed}
                    aria-label="delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <Typography variant="body1">{item.comment}</Typography>
              {item.url && (
                <Typography title={item.url} color="textSecondary">
                  Location: {item.url}
                </Typography>
              )}
              <Box
                pt={2}
                width="100%"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">
                  <Rating name="read-only" value={item.rating} readOnly />
                </Typography>
                <Typography variant="body1">
                  {formatDateAndTime(item.created_at)}
                </Typography>
              </Box>
            </InfoCard>
          </Box>
        </Grid>
      ))}

      <Dialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
      >
        <DialogTitle>Confirm Restore</DialogTitle>
        <DialogContent>
          Are you sure you want to restore this feedback to active?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleRestore}
            color="primary"
            variant="outlined"
            style={{ marginLeft: '8px' }}
          >
            Restore
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Permanent Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to permanently delete this feedback? This action
          cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="primary"
            variant="outlined"
            style={{ marginLeft: '8px' }}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
