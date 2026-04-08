import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'open-feedback',
});

export const archivedFeedbackRouteRef = createSubRouteRef({
  id: 'open-feedback-archived',
  parent: rootRouteRef,
  path: '/archived',
});
