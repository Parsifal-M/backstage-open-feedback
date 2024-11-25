import express from 'express';
import request from 'supertest';
import { createRouter } from './router';
import { OpenFeedbackDatabaseHandler } from '../database/DatabaseHandler';
import { AppFeedback } from '@parsifal-m/backstage-plugin-open-feedback-common';
import { mockServices } from '@backstage/backend-test-utils';

const mockDatabaseHandler = {
  addFeedback: jest.fn(),
  getFeedback: jest.fn<Promise<AppFeedback[]>, []>(),
  removeFeedback: jest.fn(),
} as unknown as OpenFeedbackDatabaseHandler;

const mockLogger = mockServices.logger.mock();

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const mockConfig = mockServices.rootConfig({});
    const router = await createRouter({
      logger: mockLogger,
      config: mockConfig,
      databaseHandler: mockDatabaseHandler,
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /feedback/submit', () => {
    it('returns ok when feedback is added', async () => {
      const feedback = {
        rating: 5,
        url: 'test-url',
        comment: 'Great!',
        userRef: 'user1',
      };

      (mockDatabaseHandler.addFeedback as jest.Mock).mockResolvedValueOnce(
        undefined,
      );

      const response = await request(app)
        .post('/feedback/submit')
        .send(feedback);

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        status: 'ok',
        message: 'Feedback added',
      });
      expect(mockDatabaseHandler.addFeedback).toHaveBeenCalledWith(feedback);
    });
  });

  describe('GET /feedback', () => {
    it('returns feedback list', async () => {
      const feedbackList = [
        { rating: 5, url: 'test-url', comment: 'Great!', userRef: 'user1' },
      ];
      (mockDatabaseHandler.getFeedback as jest.Mock).mockResolvedValueOnce(
        feedbackList,
      );

      const response = await request(app).get('/feedback');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(feedbackList);
      expect(mockDatabaseHandler.getFeedback).toHaveBeenCalled();
    });
  });

  describe('DELETE /feedback/:id', () => {
    it('returns ok when feedback is removed', async () => {
      const feedbackId = 1;
      (mockDatabaseHandler.removeFeedback as jest.Mock).mockResolvedValueOnce(
        undefined,
      );

      const response = await request(app).delete(`/feedback/${feedbackId}`);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        status: 'ok',
        message: 'Feedback removed',
      });
      expect(mockDatabaseHandler.removeFeedback).toHaveBeenCalledWith(
        feedbackId,
      );
    });
  });
});
