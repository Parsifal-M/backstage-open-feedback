import { createRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'open-feedback',
});

export const openDialogRouteRef = createRouteRef({
  id: '/open-feedback-modal',
});
