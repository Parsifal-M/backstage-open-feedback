import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { OpenFeedbackBackendClient } from './api';
import { openFeedbackBackendRef } from './api/types';

export const openFeedbackPlugin = createPlugin({
  id: 'open-feedback',
  apis: [
    createApiFactory({
      api: openFeedbackBackendRef,
      deps: {
        fetchApi: fetchApiRef,
      },
      factory: ({ fetchApi }) => new OpenFeedbackBackendClient({ fetchApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const OpenFeedbackPage = openFeedbackPlugin.provide(
  createRoutableExtension({
    name: 'OpenFeedbackPage',
    component: () =>
      import('./components/OpenFeedbackPage').then(m => m.OpenFeedbackPage),
    mountPoint: rootRouteRef,
  }),
);
