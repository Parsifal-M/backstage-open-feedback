import { LoggerService } from '@backstage/backend-plugin-api';
import express, { Request, Response } from 'express';
import Router from 'express-promise-router';
import { Config } from '@backstage/config';
import { z } from 'zod';
import { OpenFeedbackDatabaseHandler } from '../database/DatabaseHandler';
import { SubmitFeedback } from '@parsifal-m/backstage-plugin-open-feedback-common';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';

export interface RouterOptions {
  databaseHandler: OpenFeedbackDatabaseHandler;
  config: Config;
  logger: LoggerService;
}

const idParamSchema = z.coerce.number().int().positive();

const submitFeedbackSchema = z.object({
  rating: z.number(),
  comment: z.string(),
  userRef: z.string(),
  url: z.string().max(2048),
});

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

  router.post('/feedback/submit', (req: Request, res: Response) => {
    const result = submitFeedbackSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    const feedback: SubmitFeedback = result.data;

    return databaseHandler
      .addFeedback(feedback)
      .then(() => {
        logger.info(
          `Received feedback from ${feedback.userRef} with rating ${feedback.rating}`,
        );
        res.status(201).json({ status: 'ok', message: 'Feedback added' });
      })
      .catch(error => {
        logger.error(`Failed to add feedback: ${error}`);
        res
          .status(500)
          .json({ status: 'error', message: 'Failed to add feedback' });
      });
  });

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

  router.get('/feedback/archived', (_, res: Response) => {
    databaseHandler
      .getArchivedFeedback()
      .then(feedback => {
        res.status(200).json(feedback);
      })
      .catch(error => {
        logger.error(`Failed to get archived feedback: ${error}`);
        res.status(500).json({
          status: 'error',
          message: 'Failed to get archived feedback',
        });
      });
  });

  router.patch('/feedback/:id/archive', (req: Request, res: Response) => {
    const parsed = idParamSchema.safeParse(req.params.id);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: 'Invalid ID' });
    }

    return databaseHandler
      .archiveFeedback(parsed.data)
      .then(count => {
        if (count === 0) {
          return res
            .status(404)
            .json({ status: 'error', message: 'Feedback not found' });
        }
        return res
          .status(200)
          .json({ status: 'ok', message: 'Feedback archived' });
      })
      .catch(error => {
        logger.error(`Failed to archive feedback: ${error}`);
        return res
          .status(500)
          .json({ status: 'error', message: 'Failed to archive feedback' });
      });
  });

  router.patch('/feedback/:id/restore', (req: Request, res: Response) => {
    const parsed = idParamSchema.safeParse(req.params.id);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: 'Invalid ID' });
    }

    return databaseHandler
      .restoreFeedback(parsed.data)
      .then(count => {
        if (count === 0) {
          return res
            .status(404)
            .json({ status: 'error', message: 'Feedback not found' });
        }
        return res
          .status(200)
          .json({ status: 'ok', message: 'Feedback restored' });
      })
      .catch(error => {
        logger.error(`Failed to restore feedback: ${error}`);
        return res
          .status(500)
          .json({ status: 'error', message: 'Failed to restore feedback' });
      });
  });

  router.delete('/feedback/:id', (req: Request, res: Response) => {
    const parsed = idParamSchema.safeParse(req.params.id);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: 'Invalid ID' });
    }

    return databaseHandler
      .removeFeedback(parsed.data)
      .then(count => {
        if (count === 0) {
          return res
            .status(404)
            .json({ status: 'error', message: 'Feedback not found' });
        }
        return res
          .status(200)
          .json({ status: 'ok', message: 'Feedback removed' });
      })
      .catch(error => {
        logger.error(`Failed to remove feedback: ${error}`);
        return res
          .status(500)
          .json({ status: 'error', message: 'Failed to remove feedback' });
      });
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
