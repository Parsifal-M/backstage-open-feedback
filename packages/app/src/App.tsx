import { createApp } from '@backstage/frontend-defaults';
import {
  createFrontendModule,
  ApiBlueprint,
  configApiRef,
  githubAuthApiRef,
} from '@backstage/frontend-plugin-api';
import {
  NavContentBlueprint,
  SignInPageBlueprint,
} from '@backstage/plugin-app-react';
import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
} from '@backstage/integration-react';
import {
  Sidebar,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarScrollWrapper,
  SidebarSpace,
  SignInPage,
  sidebarConfig,
  useSidebarOpenState,
  Link,
} from '@backstage/core-components';
import { SidebarSearchModal } from '@backstage/plugin-search';
import {
  Settings as SidebarSettings,
  UserSettingsSignInAvatar,
} from '@backstage/plugin-user-settings';
import { makeStyles } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import FeedbackIcon from '@material-ui/icons/Feedback';
import openFeedbackPlugin, {
  OpenFeedbackModal,
} from '@parsifal-m/backstage-plugin-open-feedback';
import LogoFull from './components/Root/LogoFull';
import LogoIcon from './components/Root/LogoIcon';

const useSidebarLogoStyles = makeStyles({
  root: {
    width: sidebarConfig.drawerWidthClosed,
    height: 3 * sidebarConfig.logoHeight,
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    marginBottom: -14,
  },
  link: {
    width: sidebarConfig.drawerWidthClosed,
    marginLeft: 24,
  },
});

const SidebarLogo = () => {
  const classes = useSidebarLogoStyles();
  const { isOpen } = useSidebarOpenState();
  return (
    <div className={classes.root}>
      <Link to="/" underline="none" className={classes.link} aria-label="Home">
        {isOpen ? <LogoFull /> : <LogoIcon />}
      </Link>
    </div>
  );
};

const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => props =>
      (
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

const navContent = NavContentBlueprint.make({
  params: {
    component: ({ navItems }) => {
      const nav = navItems.withComponent(item => (
        <SidebarItem icon={() => item.icon} to={item.href} text={item.title} />
      ));

      return (
        <Sidebar>
          <SidebarLogo />
          <SidebarGroup label="Search" icon={<SearchIcon />} to="/search">
            <SidebarSearchModal />
            <OpenFeedbackModal
              floating
              title="OpenFeedback"
              rating={2}
              disableAnonymous={false}
              icon={FeedbackIcon}
              style={{ position: 'fixed', bottom: 20, right: 20 }}
            />
          </SidebarGroup>
          <SidebarDivider />
          <SidebarGroup label="Menu" icon={<MenuIcon />}>
            {nav.take('page:catalog')}
            {nav.take('page:api-docs')}
            {nav.take('page:techdocs')}
            {nav.take('page:scaffolder')}
            {nav.take('page:open-feedback')}
            <SidebarDivider />
            <SidebarScrollWrapper>
              {nav.rest({ sortBy: 'title' })}
            </SidebarScrollWrapper>
          </SidebarGroup>
          <SidebarSpace />
          <SidebarDivider />
          <SidebarGroup
            label="Settings"
            icon={<UserSettingsSignInAvatar />}
            to="/settings"
          >
            <SidebarSettings />
          </SidebarGroup>
        </Sidebar>
      );
    },
  },
});

const appModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    signInPage,
    navContent,
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

const app = createApp({
  features: [openFeedbackPlugin, appModule],
});

export default app.createRoot();
