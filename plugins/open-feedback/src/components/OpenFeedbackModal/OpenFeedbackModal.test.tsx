import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { fireEvent, screen } from '@testing-library/react';
import { alertApiRef } from '@backstage/core-plugin-api';
import React, { act } from 'react';
import { OpenFeedbackModal } from './OpenFeedbackModal';
import { openFeedbackBackendRef } from '../../api/types';
import { usePermission } from '@backstage/plugin-permission-react';

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

const mockOpenFeedbackBackendApi = {
  getFeedback: jest.fn(),
  removeFeedback: jest.fn(),
};

const mockAlertApi = {
  post: jest.fn(),
};

describe('OpenFeedbackModal', () => {
  it('renders main component', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await act(async () => {
      renderInTestApp(
        <TestApiProvider
          apis={[[openFeedbackBackendRef, mockOpenFeedbackBackendApi]]}
        >
          <OpenFeedbackModal title="Submit Feedback" />
        </TestApiProvider>,
      );
    });

    expect(await screen.getByRole('button')).toBeInTheDocument();

    expect(await screen.getByRole('button').getAttribute('aria-label')).toEqual(
      'Submit Feedback',
    );
  });

  it('OpenModalVerifyDefaultContents', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await act(async () => {
      renderInTestApp(
        <TestApiProvider
          apis={[
            [alertApiRef, mockAlertApi],
            [openFeedbackBackendRef, mockOpenFeedbackBackendApi],
          ]}
        >
          <OpenFeedbackModal title="Submit Feedback" />
        </TestApiProvider>,
      );
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(await screen.findByText('Submit Feedback')).toBeInTheDocument();
    expect(await screen.queryByText('Submit anonymously')).toBeInTheDocument();
  });

  it('OpenModalVerifyDisableAnon', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await act(async () => {
      renderInTestApp(
        <TestApiProvider
          apis={[
            [alertApiRef, mockAlertApi],
            [openFeedbackBackendRef, mockOpenFeedbackBackendApi],
          ]}
        >
          <OpenFeedbackModal title="Submit Feedback" disableAnonymous />
        </TestApiProvider>,
      );
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(await screen.findByText('Submit Feedback')).toBeInTheDocument();
    expect(await screen.queryByText('Submit anonymously')).toBeNull();
  });
});
