import { createPermission } from '@backstage/plugin-permission-common';

/**
 * @public
 */
export const openFeedbackReadPermission = createPermission({
  name: 'open.feedback.read',
  attributes: { action: 'read' },
});

export const openFeedbackCreatePermission = createPermission({
    name: 'open.feedback.create',
    attributes: { action: 'create' },
});

/**
 * @public
 */

export const openFeedbackPermissions = [
    openFeedbackReadPermission,
    openFeedbackCreatePermission,
];