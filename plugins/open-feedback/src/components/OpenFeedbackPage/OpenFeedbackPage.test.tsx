import React, { act } from 'react';
import { screen } from '@testing-library/react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { usePermission } from '@backstage/plugin-permission-react';
import { alertApiRef } from '@backstage/core-plugin-api';
import { openFeedbackBackendRef } from '../../api/types';
import { OpenFeedbackPage } from './OpenFeedbackPage';

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

const mockOpenFeedbackBackendApi = {
  getFeedback: () =>
    Promise.resolve([
      {
        id: 1,
        rating: 5,
        url: 'test-url',
        comment: 'Very good!, much test!',
        userRef: 'Baz',
        created_at: '2024-07-05T07:30:00Z',
      },
    ]),
  removeFeedback: jest.fn(),
};

const mockAlertApi = {
  post: jest.fn(),
};

describe('OpenFeedbackPage', () => {
  it('renders the page without crashing', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await act(async () => {
      renderInTestApp(
        <TestApiProvider
          apis={[
            [alertApiRef, mockAlertApi],
            [openFeedbackBackendRef, mockOpenFeedbackBackendApi],
          ]}
        >
          <OpenFeedbackPage />
        </TestApiProvider>,
      );
    });
    expect(await screen.findByText('Collected Feedback')).toBeInTheDocument();
  });

  it('renders the page with custom title and subtitle', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await act(async () => {
      renderInTestApp(
        <TestApiProvider
          apis={[
            [alertApiRef, mockAlertApi],
            [openFeedbackBackendRef, mockOpenFeedbackBackendApi],
          ]}
        >
          <OpenFeedbackPage title="Custom Title" subtitle="Custom Subtitle" />
        </TestApiProvider>,
      );
    });
    expect(await screen.findByText('Custom Title')).toBeInTheDocument();
    expect(await screen.findByText('Custom Subtitle')).toBeInTheDocument();
  });
});
