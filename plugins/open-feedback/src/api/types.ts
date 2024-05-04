import { createApiRef } from '@backstage/core-plugin-api';
import { AppFeedback, SubmitFeedback } from '@internal/backstage-plugin-open-feedback-common';

export interface OpenFeedbackBackendApi {
  getFeedback(): Promise<AppFeedback[]>;
  submitFeedback(feedback: SubmitFeedback): Promise<void>;
  removeFeedback(id: number): Promise<void>;
}

export const openFeedbackBackendRef = createApiRef<OpenFeedbackBackendApi>({
  id: 'plugin.open-feedback.service',
});
