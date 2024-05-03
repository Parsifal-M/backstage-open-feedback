import React, { useEffect, useState } from "react";
import { InfoCard } from "@backstage/core-components";
import { useApi } from "@backstage/core-plugin-api";
import { AppFeedback, openFeedbackBackendRef } from "../../api/types";
import { Grid, Box, Typography } from "@material-ui/core";

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

    return (
        <>
            {feedback.map((item, index) => (
                <Grid item xs={6} key={index}>
                    <Box>
                        <InfoCard title={`${item.userRef}`}>
                            <Typography variant="body1">Rating: {item.rating}</Typography>
                            <Typography variant="body1">Comment: {item.comment}</Typography>
                        </InfoCard>
                    </Box>
                </Grid>
            ))}
        </>
    );
};