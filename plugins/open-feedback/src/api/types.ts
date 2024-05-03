import { createApiRef } from '@backstage/core-plugin-api';

//! TODO: Put this in a common package
export type AppFeedback = {
    userRef: string;
    rating: string;
    comment: string;
}

export interface OpenFeedbackBackendApi {
    getFeedback(): Promise<AppFeedback[]>;
    submitFeedback(feedback: AppFeedback): Promise<void>;
}

export const openFeedbackBackendRef = createApiRef<OpenFeedbackBackendApi>({
  id: 'plugin.open-feedback.service',
});
