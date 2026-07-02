import { createPermission } from '@backstage/plugin-permission-common';

/**
 * @public
 */
export const openFeedbackPageReadPermission = createPermission({
  name: 'open.feedback.page.read',
  attributes: { action: 'read' },
});

export const openFeedbackPageDeletePermission = createPermission({
  name: 'open.feedback.page.delete',
  attributes: { action: 'delete' },
});

export const openFeedbackCreatePermission = createPermission({
  name: 'open.feedback.create',
  attributes: { action: 'create' },
});

export const openFeedbackArchivePermission = createPermission({
  name: 'open.feedback.archive',
  attributes: { action: 'update' },
});

/**
 * Controls visibility of the open-feedback nav item in the sidebar.
 * Deny this permission to hide the plugin from the sidebar for a given user/group.
 * @public
 */
export const openFeedbackNavPermission = createPermission({
  name: 'open.feedback.nav',
  attributes: { action: 'read' },
});

/**
 * @public
 */

export const openFeedbackPermissions = [
  openFeedbackPageReadPermission,
  openFeedbackCreatePermission,
  openFeedbackPageDeletePermission,
  openFeedbackArchivePermission,
  openFeedbackNavPermission,
];
