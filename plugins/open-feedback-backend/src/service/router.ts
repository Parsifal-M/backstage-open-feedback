import { errorHandler, PluginDatabaseManager, PluginEndpointDiscovery } from '@backstage/backend-common';
import { AuthService, HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import express, { Request, Response } from 'express';
import Router from 'express-promise-router';
import {body} from 'express-validator';
import { AppFeedback } from '../database/types';
import { DatabaseHandler } from '../database/DatabaseHandler';


export interface RouterOptions {
  database: PluginDatabaseManager;
  discovery: PluginEndpointDiscovery;
  logger: LoggerService;
  auth?: AuthService;
  httpAuth?: HttpAuthService;
}

const feedbackValidator = [
  body('rating').isNumeric().notEmpty(),
  body('comment').isString().notEmpty().withMessage('Comment must be a string'),
  body('userRef').isString()
];

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, database } = options;
  const db = await database.getClient();
  const dbHandler = await DatabaseHandler.create({ database:  db });

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.post('/feedback/submit', feedbackValidator, async (req: Request, res: Response) => {
    const { rating, comment, userRef } = req.body;
  
    const feedback: AppFeedback = { userRef, rating, comment };
  
    try {
      await dbHandler.addFeedback(feedback);
      logger.info(`Received feedback from ${userRef} with rating ${rating}`);
      res.status(201).json({ status: 'ok', message: 'Feedback added'});
    } catch (error) {
      logger.error(`Failed to add feedback: ${error}`);
      res.status(500).json({ status: 'error', message: 'Failed to add feedback' });
    }
  });

  router.get('/feedback', async (_, res: Response) => {
    try {
      const feedback = await dbHandler.getFeedback();
      res.status(200).json(feedback);
    } catch (error) {
      logger.error(`Failed to get feedback: ${error}`);
      res.status(500).json({ status: 'error', message: 'Failed to get feedback' });
    }
  });

  router.delete('/feedback/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
  
    try {
      await dbHandler.removeFeedback(Number(id));
      res.status(200).json({ status: 'ok', message: 'Feedback removed' });
    } catch (error) {
      logger.error(`Failed to remove feedback: ${error}`);
      res.status(500).json({ status: 'error', message: 'Failed to remove feedback' });
    }
  });

  router.use(errorHandler());
  return router;
}
