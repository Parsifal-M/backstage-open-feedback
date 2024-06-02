import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { OpenFeedbackDatabaseHandler } from './database/DatabaseHandler';

/**
 * openFeedbackPlugin backend plugin
 *
 * @public
 */
export const openFeedbackPlugin = createBackendPlugin({
  pluginId: 'open-feedback',
  register(env) {
    env.registerInit({
      deps: {
        discovery: coreServices.discovery,
        database: coreServices.database,
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
      },
      async init({ database, discovery, logger, httpRouter, auth, httpAuth }) {
        const databaseHandler = await OpenFeedbackDatabaseHandler.create(
          database,
        );
        httpRouter.use(
          await createRouter({
            databaseHandler,
            discovery,
            logger,
            auth,
            httpAuth,
          }),
        );
      },
    });
  },
});
