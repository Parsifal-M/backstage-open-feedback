import { createApiRef } from '@backstage/core-plugin-api';
import {
  AppFeedback,
  SubmitFeedback,
} from '@parsifal-m/backstage-plugin-open-feedback-common';

export interface OpenFeedbackBackendApi {
  getFeedback(): Promise<AppFeedback[]>;
  getArchivedFeedback(): Promise<AppFeedback[]>;
  submitFeedback(feedback: SubmitFeedback): Promise<void>;
  archiveFeedback(id: number): Promise<void>;
  restoreFeedback(id: number): Promise<void>;
  removeFeedback(id: number): Promise<void>;
}

export const openFeedbackBackendRef = createApiRef<OpenFeedbackBackendApi>({
  id: 'plugin.open-feedback.service',
});
