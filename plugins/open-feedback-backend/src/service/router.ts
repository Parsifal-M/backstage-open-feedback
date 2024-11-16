import {
  AuthService,
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import express, { Request, Response } from 'express';
import Router from 'express-promise-router';
import { Config } from '@backstage/config';
import { body, validationResult } from 'express-validator';
import { OpenFeedbackDatabaseHandler } from '../database/DatabaseHandler';
import { SubmitFeedback } from '@parsifal-m/backstage-plugin-open-feedback-common';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';

export interface RouterOptions {
  databaseHandler: OpenFeedbackDatabaseHandler;
  config: Config;
  logger: LoggerService;
  auth?: AuthService;
  httpAuth?: HttpAuthService;
}

const feedbackValidator = [
  body('rating').isNumeric().notEmpty(),
  body('comment').isString().withMessage('Comment must be a string'),
  body('userRef').isString(),
  body('url').isString(),
];

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, databaseHandler } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.post(
    '/feedback/submit',
    feedbackValidator,
    (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { rating, url, comment, userRef } = req.body;

      const feedback: SubmitFeedback = { userRef, url, rating, comment };

      return databaseHandler
        .addFeedback(feedback)
        .then(() => {
          logger.info(
            `Received feedback from ${userRef} with rating ${rating}`,
          );
          res.status(201).json({ status: 'ok', message: 'Feedback added' });
        })
        .catch(error => {
          logger.error(`Failed to add feedback: ${error}`);
          res
            .status(500)
            .json({ status: 'error', message: 'Failed to add feedback' });
        });
    },
  );

  router.get('/feedback', (_, res: Response) => {
    databaseHandler
      .getFeedback()
      .then(feedback => {
        res.status(200).json(feedback);
      })
      .catch(error => {
        logger.error(`Failed to get feedback: ${error}`);
        res
          .status(500)
          .json({ status: 'error', message: 'Failed to get feedback' });
      });
  });

  router.delete('/feedback/:id', (req: Request, res: Response) => {
    const { id } = req.params;

    databaseHandler
      .removeFeedback(Number(id))
      .then(() => {
        res.status(200).json({ status: 'ok', message: 'Feedback removed' });
      })
      .catch(error => {
        logger.error(`Failed to remove feedback: ${error}`);
        res
          .status(500)
          .json({ status: 'error', message: 'Failed to remove feedback' });
      });
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
