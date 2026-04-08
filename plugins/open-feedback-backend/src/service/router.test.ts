import express from 'express';
import request from 'supertest';
import { createRouter } from './router';
import { OpenFeedbackDatabaseHandler } from '../database/DatabaseHandler';
import { AppFeedback } from '@parsifal-m/backstage-plugin-open-feedback-common';
import { mockServices } from '@backstage/backend-test-utils';

const mockDatabaseHandler = {
  addFeedback: jest.fn(),
  getFeedback: jest.fn<Promise<AppFeedback[]>, []>(),
  getArchivedFeedback: jest.fn<Promise<AppFeedback[]>, []>(),
  archiveFeedback: jest.fn(),
  restoreFeedback: jest.fn(),
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

  describe('GET /feedback/archived', () => {
    it('returns archived feedback list', async () => {
      const archivedList = [
        {
          id: 2,
          rating: 3,
          url: 'test-url',
          comment: 'Archived comment',
          userRef: 'user2',
          archived: true,
        },
      ];
      (
        mockDatabaseHandler.getArchivedFeedback as jest.Mock
      ).mockResolvedValueOnce(archivedList);

      const response = await request(app).get('/feedback/archived');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(archivedList);
      expect(mockDatabaseHandler.getArchivedFeedback).toHaveBeenCalled();
    });
  });

  describe('PATCH /feedback/:id/archive', () => {
    it('returns ok when feedback is archived', async () => {
      const feedbackId = 1;
      (mockDatabaseHandler.archiveFeedback as jest.Mock).mockResolvedValueOnce(
        undefined,
      );

      const response = await request(app).patch(
        `/feedback/${feedbackId}/archive`,
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        status: 'ok',
        message: 'Feedback archived',
      });
      expect(mockDatabaseHandler.archiveFeedback).toHaveBeenCalledWith(
        feedbackId,
      );
    });
  });

  describe('PATCH /feedback/:id/restore', () => {
    it('returns ok when feedback is restored', async () => {
      const feedbackId = 1;
      (mockDatabaseHandler.restoreFeedback as jest.Mock).mockResolvedValueOnce(
        undefined,
      );

      const response = await request(app).patch(
        `/feedback/${feedbackId}/restore`,
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        status: 'ok',
        message: 'Feedback restored',
      });
      expect(mockDatabaseHandler.restoreFeedback).toHaveBeenCalledWith(
        feedbackId,
      );
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
