import { createApiRef } from '@backstage/core-plugin-api';

//! TODO: Put this in a common package
export type AppFeedback = {
    id: number;
    userRef: string;
    rating: number;
    comment: string;
}

export interface OpenFeedbackBackendApi {
    getFeedback(): Promise<AppFeedback[]>;
    submitFeedback(feedback: AppFeedback): Promise<void>;
    removeFeedback(id: number): Promise<void>;
}

export const openFeedbackBackendRef = createApiRef<OpenFeedbackBackendApi>({
  id: 'plugin.open-feedback.service',
});
