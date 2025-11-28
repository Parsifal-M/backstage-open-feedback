import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { alertApiRef } from '@backstage/core-plugin-api';
import { act } from 'react';
import { FeedbackCards } from './OpenFeedbackCard';
import { openFeedbackBackendRef } from '../../api/types';
import { usePermission } from '@backstage/plugin-permission-react';
import { entityRouteRef } from '@backstage/plugin-catalog-react';

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

describe('FeedbackCards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    mockOpenFeedbackBackendApi.getFeedback.mockResolvedValue([
      {
        id: 1,
        rating: 5,
        url: 'test-url',
        comment: 'Very good!, much test!',
        userRef: 'user:default/baz',
        created_at: '2024-07-05T07:30:00Z',
      },
    ]);
  });

  it('renders a card with feedback', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await act(async () => {
      renderInTestApp(
        <TestApiProvider
          apis={[
            [alertApiRef, mockAlertApi],
            [openFeedbackBackendRef, mockOpenFeedbackBackendApi],
          ]}
        >
          <FeedbackCards />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/catalog/:namespace/:kind/:name': entityRouteRef,
          },
        },
      );
    });
    expect(
      await screen.findByText('Very good!, much test!'),
    ).toBeInTheDocument();
  });

  it('renders an emoji for a rating', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await act(async () => {
      renderInTestApp(
        <TestApiProvider
          apis={[
            [alertApiRef, mockAlertApi],
            [openFeedbackBackendRef, mockOpenFeedbackBackendApi],
          ]}
        >
          <FeedbackCards />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/catalog/:namespace/:kind/:name': entityRouteRef,
          },
        },
      );
    });
    expect(await screen.findByText('baz')).toBeInTheDocument();
    expect(await screen.findByText('🤩')).toBeInTheDocument();
  });

  it('renders a timestamp for feedback', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await act(async () => {
      renderInTestApp(
        <TestApiProvider
          apis={[
            [alertApiRef, mockAlertApi],
            [openFeedbackBackendRef, mockOpenFeedbackBackendApi],
          ]}
        >
          <FeedbackCards />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/catalog/:namespace/:kind/:name': entityRouteRef,
          },
        },
      );
    });
    expect(await screen.findByText('05-07-2024')).toBeInTheDocument();
  });

  it('renders the delete dialog', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await act(async () => {
      renderInTestApp(
        <TestApiProvider
          apis={[
            [alertApiRef, mockAlertApi],
            [openFeedbackBackendRef, mockOpenFeedbackBackendApi],
          ]}
        >
          <FeedbackCards />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/catalog/:namespace/:kind/:name': entityRouteRef,
          },
        },
      );
    });
    const deleteButton = await screen.findByTestId('delete-feedback-button');
    fireEvent.click(deleteButton);
    expect(
      await screen.findByText('Are you sure you want to delete this feedback?'),
    ).toBeInTheDocument();
  });

  it('closes the feedback dialog and does not delete feedback when Cancel is clicked', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await act(async () => {
      renderInTestApp(
        <TestApiProvider
          apis={[
            [alertApiRef, mockAlertApi],
            [openFeedbackBackendRef, mockOpenFeedbackBackendApi],
          ]}
        >
          <FeedbackCards />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/catalog/:namespace/:kind/:name': entityRouteRef,
          },
        },
      );
    });
    const deleteButton = await screen.findByTestId('delete-feedback-button');
    fireEvent.click(deleteButton);
    fireEvent.click(await screen.findByText('Cancel'));
    expect(mockOpenFeedbackBackendApi.removeFeedback).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(
        screen.queryByText('Are you sure you want to delete this feedback?'),
      ).not.toBeInTheDocument();
    });
  });

  it('deletes feedback', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await act(async () => {
      renderInTestApp(
        <TestApiProvider
          apis={[
            [alertApiRef, mockAlertApi],
            [openFeedbackBackendRef, mockOpenFeedbackBackendApi],
          ]}
        >
          <FeedbackCards />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/catalog/:namespace/:kind/:name': entityRouteRef,
          },
        },
      );
    });
    const deleteButton = await screen.findByTestId('delete-feedback-button');
    fireEvent.click(deleteButton);
    fireEvent.click(await screen.findByText('Delete'));
    expect(mockOpenFeedbackBackendApi.removeFeedback).toHaveBeenCalledWith(1);
  });

  it('throws an error if delete fails', async () => {
    const errorMessage = 'Oops Something went wrong!';
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    mockOpenFeedbackBackendApi.removeFeedback.mockImplementation(() =>
      Promise.reject(new Error(errorMessage)),
    );
    await act(async () => {
      renderInTestApp(
        <TestApiProvider
          apis={[
            [alertApiRef, mockAlertApi],
            [openFeedbackBackendRef, mockOpenFeedbackBackendApi],
          ]}
        >
          <FeedbackCards />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/catalog/:namespace/:kind/:name': entityRouteRef,
          },
        },
      );
    });
    const deleteButton = await screen.findByTestId('delete-feedback-button');
    fireEvent.click(deleteButton);
    fireEvent.click(await screen.findByText('Delete'));

    await waitFor(() => {
      expect(mockAlertApi.post).toHaveBeenCalledWith({
        message: `Failed to delete feedback: Error: ${errorMessage}`,
        severity: 'error',
      });
    });
  });

  it('disables delete button when not allowed', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: false });
    await act(async () => {
      renderInTestApp(
        <TestApiProvider
          apis={[
            [alertApiRef, mockAlertApi],
            [openFeedbackBackendRef, mockOpenFeedbackBackendApi],
          ]}
        >
          <FeedbackCards />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/catalog/:namespace/:kind/:name': entityRouteRef,
          },
        },
      );
    });
    const deleteButton = await screen.findByTestId('delete-feedback-button');
    expect(deleteButton).toBeDisabled();
  });

  it('posts an alert error when fails to fetch feedback', async () => {
    const errorMessage = 'Oops Something went wrong!';
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    mockOpenFeedbackBackendApi.getFeedback.mockImplementation(() =>
      Promise.reject(new Error(errorMessage)),
    );
    await act(async () => {
      renderInTestApp(
        <TestApiProvider
          apis={[
            [alertApiRef, mockAlertApi],
            [openFeedbackBackendRef, mockOpenFeedbackBackendApi],
          ]}
        >
          <FeedbackCards />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/catalog/:namespace/:kind/:name': entityRouteRef,
          },
        },
      );
    });
    expect(mockAlertApi.post).toHaveBeenCalledWith({
      message: `Failed to fetch feedback: Error: ${errorMessage}`,
      severity: 'error',
    });
  });
});
