import { Navigate } from 'react-router-dom';
import {
  createFrontendModule,
  ApiBlueprint,
  PageBlueprint,
  configApiRef,
  githubAuthApiRef,
} from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
} from '@backstage/integration-react';
import { SignInPage } from '@backstage/core-components';

const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => props => (
      <SignInPage
        {...props}
        providers={[
          'guest',
          {
            id: 'github-auth-provider',
            title: 'GitHub',
            message: 'Sign in using GitHub',
            apiRef: githubAuthApiRef,
          },
        ]}
      />
    ),
  },
});

const rootRedirect = PageBlueprint.make({
  name: 'root-redirect',
  params: {
    path: '/',
    loader: async () => <Navigate to="/catalog" replace />,
  },
});

export const appOverride = createFrontendModule({
  pluginId: 'app',
  extensions: [
    signInPage,
    rootRedirect,
    ApiBlueprint.make({
      name: 'scm-integrations',
      params: defineParams =>
        defineParams({
          api: scmIntegrationsApiRef,
          deps: { configApi: configApiRef },
          factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
        }),
    }),
  ],
});
