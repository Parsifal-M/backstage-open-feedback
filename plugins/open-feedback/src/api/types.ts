import { createApiRef } from '@backstage/frontend-plugin-api';
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

export const openFeedbackBackendRef =
  createApiRef<OpenFeedbackBackendApi>().with({
    id: 'plugin.open-feedback.service',
    pluginId: 'open-feedback',
  });
