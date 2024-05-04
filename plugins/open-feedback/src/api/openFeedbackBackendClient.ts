import { AppFeedback, SubmitFeedback } from '@internal/backstage-plugin-open-feedback-common';
import { OpenFeedbackBackendApi } from './types';
import { FetchApi } from '@backstage/core-plugin-api';

export class OpenFeedbackBackendClient implements OpenFeedbackBackendApi {
  private readonly fetchApi: FetchApi;
  constructor(options: { fetchApi: FetchApi}) {
    this.fetchApi = options.fetchApi;
  }
  private async handleResponse(response: Response): Promise<AppFeedback[]> {
    if (!response.ok) {
      const message = `Error ${response.status}: ${response.statusText}.`;

      try {
        const responseBody = await response.json();
        throw new Error(
          `${message} Details: ${
            responseBody.error || 'No additional details provided.'
          }`,
        );
      } catch (error) {
        throw new Error(message);
      }
    }

    const data = await response.json();
    return data as AppFeedback[];
  }

  async getFeedback(): Promise<AppFeedback[]> {
    const url = `plugin://open-feedback/feedback`
    const response = await this.fetchApi.fetch(url);
    return await this.handleResponse(response);
  }

  async submitFeedback(feedback: SubmitFeedback): Promise<void> {
    const url = `plugin://open-feedback/feedback/submit`
    const response = await this.fetchApi.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });
    await this.handleResponse(response);
  }

  async removeFeedback(id: number): Promise<void> {
    const url = `plugin://open-feedback/feedback/${id}`
    const response = await this.fetchApi.fetch(url, {
      method: 'DELETE',
    });
    await this.handleResponse(response);
  }

}
