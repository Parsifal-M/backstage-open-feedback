import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';
import searchPlugin from '@backstage/plugin-search/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import openFeedbackPlugin from '@parsifal-m/backstage-plugin-open-feedback';
import { navModule } from './components/Root';
import { appOverride } from './overrides/app';

const app = createApp({
  features: [
    appOverride,
    catalogPlugin,
    scaffolderPlugin,
    techdocsPlugin,
    searchPlugin,
    userSettingsPlugin,
    openFeedbackPlugin,
    navModule,
  ],
});

export default app.createRoot();
