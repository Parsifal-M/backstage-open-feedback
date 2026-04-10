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
  getArchivedFeedback: jest.fn(),
  removeFeedback: jest.fn(),
  archiveFeedback: jest.fn(),
  restoreFeedback: jest.fn(),
};

const mockAlertApi = { post: jest.fn() };

const activeFeedback = [
  {
    id: 1,
    rating: 5,
    url: 'test-url',
    comment: 'Very good!, much test!',
    userRef: 'user:default/baz',
    created_at: '2024-07-05T07:30:00Z',
    archived: false,
  },
];

const archivedFeedback = [
  {
    id: 2,
    rating: 3,
    url: 'archived-url',
    comment: 'Archived feedback comment',
    userRef: 'user:default/archiveduser',
    created_at: '2024-08-10T10:00:00Z',
    archived: true,
  },
];

const renderActive = async (props: { onArchive?: () => void } = {}) => {
  await act(async () => {
    renderInTestApp(
      <TestApiProvider
        apis={[
          [alertApiRef, mockAlertApi],
          [openFeedbackBackendRef, mockOpenFeedbackBackendApi],
        ]}
      >
        <FeedbackCards mode="active" {...props} />
      </TestApiProvider>,
      { mountedRoutes: { '/catalog/:namespace/:kind/:name': entityRouteRef } },
    );
  });
};

const renderArchived = async (props: { refreshKey?: number } = {}) => {
  await act(async () => {
    renderInTestApp(
      <TestApiProvider
        apis={[
          [alertApiRef, mockAlertApi],
          [openFeedbackBackendRef, mockOpenFeedbackBackendApi],
        ]}
      >
        <FeedbackCards mode="archived" {...props} />
      </TestApiProvider>,
      { mountedRoutes: { '/catalog/:namespace/:kind/:name': entityRouteRef } },
    );
  });
};

describe('FeedbackCards — active mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOpenFeedbackBackendApi.getFeedback.mockResolvedValue(activeFeedback);
  });

  it('renders a card with feedback', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await renderActive();
    expect(
      await screen.findByText('Very good!, much test!'),
    ).toBeInTheDocument();
  });

  it('renders an empty state when there is no active feedback', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    mockOpenFeedbackBackendApi.getFeedback.mockResolvedValueOnce([]);
    await renderActive();
    expect(
      await screen.findByText('No feedback received yet!'),
    ).toBeInTheDocument();
  });

  it('renders an emoji for a rating', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await renderActive();
    expect(await screen.findByText('baz')).toBeInTheDocument();
    expect(await screen.findByText('🤩')).toBeInTheDocument();
  });

  it('renders a timestamp for feedback', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await renderActive();
    expect(await screen.findByText('05-07-2024')).toBeInTheDocument();
  });

  it('renders the delete dialog', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await renderActive();
    fireEvent.click(await screen.findByTestId('delete-feedback-button'));
    expect(
      await screen.findByText('Are you sure you want to delete this feedback?'),
    ).toBeInTheDocument();
  });

  it('closes the delete dialog and does not delete when Cancel is clicked', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await renderActive();
    fireEvent.click(await screen.findByTestId('delete-feedback-button'));
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
    await renderActive();
    fireEvent.click(await screen.findByTestId('delete-feedback-button'));
    fireEvent.click(await screen.findByText('Delete'));
    expect(mockOpenFeedbackBackendApi.removeFeedback).toHaveBeenCalledWith(1);
  });

  it('posts an alert error when delete fails', async () => {
    const errorMessage = 'Oops Something went wrong!';
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    mockOpenFeedbackBackendApi.removeFeedback.mockRejectedValueOnce(
      new Error(errorMessage),
    );
    await renderActive();
    fireEvent.click(await screen.findByTestId('delete-feedback-button'));
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
    await renderActive();
    expect(await screen.findByTestId('delete-feedback-button')).toBeDisabled();
  });

  it('posts an alert error when fetch fails', async () => {
    const errorMessage = 'Oops Something went wrong!';
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    mockOpenFeedbackBackendApi.getFeedback.mockRejectedValueOnce(
      new Error(errorMessage),
    );
    await renderActive();
    expect(mockAlertApi.post).toHaveBeenCalledWith({
      message: `Failed to fetch feedback: Error: ${errorMessage}`,
      severity: 'error',
    });
  });

  it('renders the archive dialog when archive button is clicked', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await renderActive();
    fireEvent.click(await screen.findByTestId('archive-feedback-button'));
    expect(
      await screen.findByText(
        'Are you sure you want to archive this feedback? You can restore it later from the Archived tab.',
      ),
    ).toBeInTheDocument();
  });

  it('closes the archive dialog and does not archive when Cancel is clicked', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await renderActive();
    fireEvent.click(await screen.findByTestId('archive-feedback-button'));
    fireEvent.click(await screen.findByText('Cancel'));
    expect(mockOpenFeedbackBackendApi.archiveFeedback).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(
        screen.queryByText(
          'Are you sure you want to archive this feedback? You can restore it later from the Archived tab.',
        ),
      ).not.toBeInTheDocument();
    });
  });

  it('archives feedback, removes it from the list, and calls onArchive', async () => {
    const onArchive = jest.fn();
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    mockOpenFeedbackBackendApi.archiveFeedback.mockResolvedValueOnce(undefined);
    await renderActive({ onArchive });
    fireEvent.click(await screen.findByTestId('archive-feedback-button'));
    fireEvent.click(await screen.findByText('Archive'));
    expect(mockOpenFeedbackBackendApi.archiveFeedback).toHaveBeenCalledWith(1);
    await waitFor(() => expect(onArchive).toHaveBeenCalledTimes(1));
  });

  it('posts an alert error when archive fails', async () => {
    const errorMessage = 'Archive failed!';
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    mockOpenFeedbackBackendApi.archiveFeedback.mockRejectedValueOnce(
      new Error(errorMessage),
    );
    await renderActive();
    fireEvent.click(await screen.findByTestId('archive-feedback-button'));
    fireEvent.click(await screen.findByText('Archive'));
    await waitFor(() => {
      expect(mockAlertApi.post).toHaveBeenCalledWith({
        message: `Failed to archive feedback: Error: ${errorMessage}`,
        severity: 'error',
      });
    });
  });

  it('disables archive button when not allowed', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: false });
    await renderActive();
    expect(await screen.findByTestId('archive-feedback-button')).toBeDisabled();
  });
});

describe('FeedbackCards — archived mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOpenFeedbackBackendApi.getArchivedFeedback.mockResolvedValue(
      archivedFeedback,
    );
  });

  it('renders archived feedback cards', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await renderArchived();
    expect(
      await screen.findByText('Archived feedback comment'),
    ).toBeInTheDocument();
  });

  it('renders an empty state when there is no archived feedback', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    mockOpenFeedbackBackendApi.getArchivedFeedback.mockResolvedValueOnce([]);
    await renderArchived();
    expect(
      await screen.findByText('No archived feedback found.'),
    ).toBeInTheDocument();
  });

  it('renders a timestamp for archived feedback', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await renderArchived();
    expect(await screen.findByText('10-08-2024')).toBeInTheDocument();
  });

  it('posts an alert error when fetch fails', async () => {
    const errorMessage = 'Fetch failed!';
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    mockOpenFeedbackBackendApi.getArchivedFeedback.mockRejectedValueOnce(
      new Error(errorMessage),
    );
    await renderArchived();
    expect(mockAlertApi.post).toHaveBeenCalledWith({
      message: `Failed to fetch archived feedback: Error: ${errorMessage}`,
      severity: 'error',
    });
  });

  it('renders the restore dialog when restore button is clicked', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await renderArchived();
    fireEvent.click(await screen.findByTestId('restore-feedback-button'));
    expect(
      await screen.findByText(
        'Are you sure you want to restore this feedback to active?',
      ),
    ).toBeInTheDocument();
  });

  it('closes restore dialog and does not restore when Cancel is clicked', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await renderArchived();
    fireEvent.click(await screen.findByTestId('restore-feedback-button'));
    fireEvent.click(await screen.findByText('Cancel'));
    expect(mockOpenFeedbackBackendApi.restoreFeedback).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(
        screen.queryByText(
          'Are you sure you want to restore this feedback to active?',
        ),
      ).not.toBeInTheDocument();
    });
  });

  it('restores feedback and removes it from the archived list', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    mockOpenFeedbackBackendApi.restoreFeedback.mockResolvedValueOnce(undefined);
    await renderArchived();
    fireEvent.click(await screen.findByTestId('restore-feedback-button'));
    fireEvent.click(await screen.findByText('Restore'));
    expect(mockOpenFeedbackBackendApi.restoreFeedback).toHaveBeenCalledWith(2);
  });

  it('posts an alert error when restore fails', async () => {
    const errorMessage = 'Restore failed!';
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    mockOpenFeedbackBackendApi.restoreFeedback.mockRejectedValueOnce(
      new Error(errorMessage),
    );
    await renderArchived();
    fireEvent.click(await screen.findByTestId('restore-feedback-button'));
    fireEvent.click(await screen.findByText('Restore'));
    await waitFor(() => {
      expect(mockAlertApi.post).toHaveBeenCalledWith({
        message: `Failed to restore feedback: Error: ${errorMessage}`,
        severity: 'error',
      });
    });
  });

  it('renders the permanent delete dialog when delete button is clicked', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await renderArchived();
    fireEvent.click(
      await screen.findByTestId('delete-archived-feedback-button'),
    );
    expect(
      await screen.findByText(
        'Are you sure you want to permanently delete this feedback? This action cannot be undone.',
      ),
    ).toBeInTheDocument();
  });

  it('permanently deletes archived feedback', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    mockOpenFeedbackBackendApi.removeFeedback.mockResolvedValueOnce(undefined);
    await renderArchived();
    fireEvent.click(
      await screen.findByTestId('delete-archived-feedback-button'),
    );
    fireEvent.click(await screen.findByText('Delete Permanently'));
    expect(mockOpenFeedbackBackendApi.removeFeedback).toHaveBeenCalledWith(2);
  });

  it('disables restore button when not allowed', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: false });
    await renderArchived();
    expect(await screen.findByTestId('restore-feedback-button')).toBeDisabled();
  });

  it('disables delete button when not allowed', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: false });
    await renderArchived();
    expect(
      await screen.findByTestId('delete-archived-feedback-button'),
    ).toBeDisabled();
  });
});
