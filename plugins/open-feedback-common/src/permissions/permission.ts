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

/**
 * @public
 */

export const openFeedbackPermissions = [
  openFeedbackPageReadPermission,
  openFeedbackCreatePermission,
  openFeedbackPageDeletePermission,
];
