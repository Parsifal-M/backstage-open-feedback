import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { alertApiRef } from '@backstage/core-plugin-api';
import { act } from 'react';
import { ArchivedFeedbackCards } from './ArchivedFeedbackCard';
import { openFeedbackBackendRef } from '../../api/types';
import { usePermission } from '@backstage/plugin-permission-react';
import { entityRouteRef } from '@backstage/plugin-catalog-react';

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

const mockOpenFeedbackBackendApi = {
  getArchivedFeedback: jest.fn(),
  restoreFeedback: jest.fn(),
  removeFeedback: jest.fn(),
};

const mockAlertApi = {
  post: jest.fn(),
};

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

const renderComponent = async () => {
  await act(async () => {
    renderInTestApp(
      <TestApiProvider
        apis={[
          [alertApiRef, mockAlertApi],
          [openFeedbackBackendRef, mockOpenFeedbackBackendApi],
        ]}
      >
        <ArchivedFeedbackCards />
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );
  });
};

describe('ArchivedFeedbackCards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    mockOpenFeedbackBackendApi.getArchivedFeedback.mockResolvedValue(
      archivedFeedback,
    );
  });

  it('renders archived feedback cards', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await renderComponent();

    expect(
      await screen.findByText('Archived feedback comment'),
    ).toBeInTheDocument();
  });

  it('renders an empty state when there is no archived feedback', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    mockOpenFeedbackBackendApi.getArchivedFeedback.mockResolvedValueOnce([]);

    await renderComponent();

    expect(
      await screen.findByText('No archived feedback found.'),
    ).toBeInTheDocument();
  });

  it('renders a timestamp for archived feedback', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await renderComponent();

    expect(await screen.findByText('10-08-2024')).toBeInTheDocument();
  });

  it('renders the restore dialog when restore button is clicked', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await renderComponent();

    const restoreButton = await screen.findByTestId('restore-feedback-button');
    fireEvent.click(restoreButton);

    expect(
      await screen.findByText(
        'Are you sure you want to restore this feedback to active?',
      ),
    ).toBeInTheDocument();
  });

  it('closes restore dialog and does not restore when Cancel is clicked', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    await renderComponent();

    const restoreButton = await screen.findByTestId('restore-feedback-button');
    fireEvent.click(restoreButton);
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
    await renderComponent();

    const restoreButton = await screen.findByTestId('restore-feedback-button');
    fireEvent.click(restoreButton);
    fireEvent.click(await screen.findByText('Restore'));

    expect(mockOpenFeedbackBackendApi.restoreFeedback).toHaveBeenCalledWith(2);
  });

  it('posts an alert error when restore fails', async () => {
    const errorMessage = 'Restore failed!';
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    mockOpenFeedbackBackendApi.restoreFeedback.mockRejectedValueOnce(
      new Error(errorMessage),
    );
    await renderComponent();

    const restoreButton = await screen.findByTestId('restore-feedback-button');
    fireEvent.click(restoreButton);
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
    await renderComponent();

    const deleteButton = await screen.findByTestId(
      'delete-archived-feedback-button',
    );
    fireEvent.click(deleteButton);

    expect(
      await screen.findByText(
        'Are you sure you want to permanently delete this feedback? This action cannot be undone.',
      ),
    ).toBeInTheDocument();
  });

  it('permanently deletes archived feedback', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    mockOpenFeedbackBackendApi.removeFeedback.mockResolvedValueOnce(undefined);
    await renderComponent();

    const deleteButton = await screen.findByTestId(
      'delete-archived-feedback-button',
    );
    fireEvent.click(deleteButton);
    fireEvent.click(await screen.findByText('Delete Permanently'));

    expect(mockOpenFeedbackBackendApi.removeFeedback).toHaveBeenCalledWith(2);
  });

  it('disables restore button when not allowed', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: false });
    await renderComponent();

    const restoreButton = await screen.findByTestId('restore-feedback-button');
    expect(restoreButton).toBeDisabled();
  });

  it('disables delete button when not allowed', async () => {
    (usePermission as jest.Mock).mockReturnValue({ allowed: false });
    await renderComponent();

    const deleteButton = await screen.findByTestId(
      'delete-archived-feedback-button',
    );
    expect(deleteButton).toBeDisabled();
  });

  it('posts an alert error when getArchivedFeedback fails', async () => {
    const errorMessage = 'Oops Something went wrong!';
    (usePermission as jest.Mock).mockReturnValue({ allowed: true });
    mockOpenFeedbackBackendApi.getArchivedFeedback.mockRejectedValueOnce(
      new Error(errorMessage),
    );
    await renderComponent();

    expect(mockAlertApi.post).toHaveBeenCalledWith({
      message: `Failed to fetch archived feedback: Error: ${errorMessage}`,
      severity: 'error',
    });
  });
});
