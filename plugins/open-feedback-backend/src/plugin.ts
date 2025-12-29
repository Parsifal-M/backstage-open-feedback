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
        config: coreServices.rootConfig,
        database: coreServices.database,
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
      },
      async init({ config, database, logger, httpRouter }) {
        const databaseHandler =
          await OpenFeedbackDatabaseHandler.create(database);
        httpRouter.use(
          await createRouter({
            config,
            databaseHandler,
            logger,
          }),
        );
      },
    });
  },
});
