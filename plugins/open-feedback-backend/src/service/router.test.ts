import { getVoidLogger } from '@backstage/backend-common';
import express from 'express';
import request from 'supertest';
import { createRouter } from './router';
import { OpenFeedbackDatabaseHandler } from '../database/DatabaseHandler';

const mockDatabaseHandler = {
  addFeedback: jest.fn(),
  getFeedback: jest.fn(),
  removeFeedback: jest.fn(),
} as unknown as OpenFeedbackDatabaseHandler;

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      databaseHandler: mockDatabaseHandler,
      discovery: {
        getBaseUrl: jest.fn(),
        // eslint-disable-next-line func-names
        getExternalBaseUrl: function (_pluginId: string): Promise<string> {
          throw new Error('Function not implemented.');
        },
      },
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
      const feedback = { rating: 5, url: "test-url", comment: 'Great!', userRef: 'user1' };

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
      const feedbackList = [{ rating: 5, url: "test-url", comment: 'Great!', userRef: 'user1' }];
      mockDatabaseHandler.getFeedback = jest
        .fn()
        .mockResolvedValue(feedbackList);

      const response = await request(app).get('/feedback');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(feedbackList);
      expect(mockDatabaseHandler.getFeedback).toHaveBeenCalled();
    });
  });

  describe('DELETE /feedback/:id', () => {
    it('returns ok when feedback is removed', async () => {
      const feedbackId = 1;
      mockDatabaseHandler.removeFeedback = jest
        .fn()
        .mockResolvedValue(feedbackId);

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
