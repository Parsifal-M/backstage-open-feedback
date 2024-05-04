import React, { useEffect, useState } from "react";
import { InfoCard } from "@backstage/core-components";
import { useApi } from "@backstage/core-plugin-api";
import { AppFeedback, openFeedbackBackendRef } from "../../api/types";
import { Grid, Box, Typography } from "@material-ui/core";
import Rating from '@mui/material/Rating';

export const FeedbackCards = () => {
    const [feedback, setFeedback] = useState<AppFeedback[]>([]);
    const feedbackApi = useApi(openFeedbackBackendRef);

    useEffect(() => {
        const fetchFeedback = async () => {
            const feedbackData = await feedbackApi.getFeedback();
            setFeedback(feedbackData);
        };

        fetchFeedback();
    }, [feedbackApi]);

    const getRatingEmoji = (rating: number) => {
        if (rating === 5) return '🤩';
        if (rating >= 4) return '😃';
        if (rating >= 3) return '😊';
        if (rating >= 2) return '😐';
        return '😞';
    };

    return (
        <>
          {feedback.map((item, index) => (
            <Grid item xs={6} key={index}>
              <Box>
                <InfoCard title={`${item.userRef} ${getRatingEmoji(item.rating)}`}>
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
        </>
      );
    };