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
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import Skeleton from '@mui/material/Skeleton';
import {
  AppFeedback,
  openFeedbackPageDeletePermission,
  openFeedbackArchivePermission,
} from '@parsifal-m/backstage-plugin-open-feedback-common';
import { usePermission } from '@backstage/plugin-permission-react';
import { EntityRefLink } from '@backstage/plugin-catalog-react';

export const getRatingEmoji = (rating: number) => {
  if (rating === 5) return '🤩';
  if (rating >= 4) return '😃';
  if (rating >= 3) return '😊';
  if (rating >= 2) return '😐';
  return '😞';
};

export const formatDateAndTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
};

export interface FeedbackCardsProps {
  mode: 'active' | 'archived';
  onArchive?: () => void;
  refreshKey?: number;
}

export const FeedbackCards = ({
  mode,
  onArchive,
  refreshKey,
}: FeedbackCardsProps) => {
  const [feedback, setFeedback] = useState<AppFeedback[] | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [secondaryDialogOpen, setSecondaryDialogOpen] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const feedbackApi = useApi(openFeedbackBackendRef);
  const alertApi = useApi(alertApiRef);
  const { allowed: deleteAllowed } = usePermission({
    permission: openFeedbackPageDeletePermission,
  });
  const { allowed: archiveAllowed } = usePermission({
    permission: openFeedbackArchivePermission,
  });

  const isArchived = mode === 'archived';

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const feedbackData = isArchived
          ? await feedbackApi.getArchivedFeedback()
          : await feedbackApi.getFeedback();
        setFeedback(feedbackData);
      } catch (error) {
        alertApi.post({
          message: `Failed to fetch ${isArchived ? 'archived ' : ''}feedback: ${error}`,
          severity: 'error',
        });
      }
      setLoading(false);
    };

    fetchFeedback();
    // refreshKey is intentionally included so the archived tab re-fetches
    // when an item is archived from the active tab
  }, [feedbackApi, alertApi, refreshKey, isArchived]);

  if (loading) {
    return (
      <>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={6} key={index}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        ))}
      </>
    );
  }

  if (!feedback || feedback.length === 0) {
    return (
      <Grid item xs={12}>
        <Typography variant="body1" color="textSecondary">
          {isArchived
            ? 'No archived feedback found.'
            : 'No feedback received yet!'}
        </Typography>
      </Grid>
    );
  }

  const handleDelete = async () => {
    if (actionId === null) return;

    try {
      await feedbackApi.removeFeedback(actionId);
      setFeedback(prev => prev?.filter(item => item.id !== actionId) ?? null);
    } catch (error) {
      alertApi.post({
        message: `Failed to delete feedback: ${error}`,
        severity: 'error',
      });
    }

    setDeleteDialogOpen(false);
  };

  // Archive (active mode) or Restore (archived mode)
  const handleSecondaryAction = async () => {
    if (actionId === null) return;

    try {
      if (isArchived) {
        await feedbackApi.restoreFeedback(actionId);
      } else {
        await feedbackApi.archiveFeedback(actionId);
        onArchive?.();
      }
      setFeedback(prev => prev?.filter(item => item.id !== actionId) ?? null);
    } catch (error) {
      const action = isArchived ? 'restore' : 'archive';
      alertApi.post({
        message: `Failed to ${action} feedback: ${error}`,
        severity: 'error',
      });
    }

    setSecondaryDialogOpen(false);
  };

  return (
    <>
      {feedback?.map(item => (
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
                    data-testid={
                      isArchived
                        ? 'restore-feedback-button'
                        : 'archive-feedback-button'
                    }
                    onClick={() => {
                      setActionId(item.id);
                      setSecondaryDialogOpen(true);
                    }}
                    disabled={!archiveAllowed}
                    aria-label={isArchived ? 'restore' : 'archive'}
                  >
                    {isArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
                  </IconButton>
                  <IconButton
                    data-testid={
                      isArchived
                        ? 'delete-archived-feedback-button'
                        : 'delete-feedback-button'
                    }
                    onClick={() => {
                      setActionId(item.id);
                      setDeleteDialogOpen(true);
                    }}
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

      {/* Archive / Restore dialog */}
      <Dialog
        open={secondaryDialogOpen}
        onClose={() => setSecondaryDialogOpen(false)}
      >
        <DialogTitle>
          {isArchived ? 'Confirm Restore' : 'Confirm Archive'}
        </DialogTitle>
        <DialogContent>
          {isArchived
            ? 'Are you sure you want to restore this feedback to active?'
            : 'Are you sure you want to archive this feedback? You can restore it later from the Archived tab.'}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSecondaryDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSecondaryAction}
            color="primary"
            variant="outlined"
            style={{ marginLeft: '8px' }}
          >
            {isArchived ? 'Restore' : 'Archive'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          {isArchived ? 'Confirm Permanent Deletion' : 'Confirm Deletion'}
        </DialogTitle>
        <DialogContent>
          {isArchived
            ? 'Are you sure you want to permanently delete this feedback? This action cannot be undone.'
            : 'Are you sure you want to delete this feedback?'}
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
            {isArchived ? 'Delete Permanently' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
