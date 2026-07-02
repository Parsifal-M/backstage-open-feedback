import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import {
  ApiBlueprint,
  PageBlueprint,
  SubPageBlueprint,
  createFrontendPlugin,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { rootRouteRef } from './routes';
import { openFeedbackBackendRef } from './api/types';
import { OpenFeedbackBackendClient } from './api';

const openFeedbackApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: openFeedbackBackendRef,
      deps: { fetchApi: fetchApiRef },
      factory: ({ fetchApi }) => new OpenFeedbackBackendClient({ fetchApi }),
    }),
});

const openFeedbackPage = PageBlueprint.make({
  params: {
    path: '/open-feedback',
    routeRef: rootRouteRef,
  },
});

const activeFeedbackSubPage = SubPageBlueprint.make({
  name: 'active',
  params: {
    path: 'active',
    title: 'Active',
    loader: () =>
      import('./components/OpenFeedbackPage').then(m => (
        <m.ActiveFeedbackContent />
      )),
  },
});

const archivedFeedbackSubPage = SubPageBlueprint.make({
  name: 'archived',
  params: {
    path: 'archived',
    title: 'Archived',
    loader: () =>
      import('./components/OpenFeedbackPage').then(m => (
        <m.ArchivedFeedbackContent />
      )),
  },
});

export default createFrontendPlugin({
  pluginId: 'open-feedback',
  title: 'Open Feedback',
  icon: <ThumbUpAltIcon fontSize="inherit" />,
  info: {
    packageJson: () => import('../package.json'),
  },
  routes: {
    root: rootRouteRef,
  },
  extensions: [
    openFeedbackApi,
    openFeedbackPage,
    activeFeedbackSubPage,
    archivedFeedbackSubPage,
  ],
});
