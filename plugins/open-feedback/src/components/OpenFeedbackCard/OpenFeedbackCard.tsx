import React, { useEffect, useState } from "react";
import { InfoCard } from "@backstage/core-components";
import { useApi } from "@backstage/core-plugin-api";
import { AppFeedback, openFeedbackBackendRef } from "../../api/types";

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
          <InfoCard key={index} title="Feedback">
            <p>User Reference: {item.userRef}</p>
            <p>Rating: {item.rating}</p>
            <p>Comment: {item.comment}</p>
          </InfoCard>
        ))}
      </>
    );
  };