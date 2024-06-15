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
      { id: 1, rating: 5, comment: 'Very good!, much test!', userRef: 'Baz' },
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
});
