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
      (mockDatabaseHandler.archiveFeedback as jest.Mock).mockResolvedValueOnce(
        1,
      );

      const response = await request(app).patch('/feedback/1/archive');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        status: 'ok',
        message: 'Feedback archived',
      });
      expect(mockDatabaseHandler.archiveFeedback).toHaveBeenCalledWith(1);
    });

    it('returns 404 when feedback is not found', async () => {
      (mockDatabaseHandler.archiveFeedback as jest.Mock).mockResolvedValueOnce(
        0,
      );

      const response = await request(app).patch('/feedback/99/archive');

      expect(response.status).toEqual(404);
      expect(mockDatabaseHandler.archiveFeedback).toHaveBeenCalledWith(99);
    });

    it('returns 400 for a non-numeric id', async () => {
      const response = await request(app).patch('/feedback/abc/archive');

      expect(response.status).toEqual(400);
      expect(mockDatabaseHandler.archiveFeedback).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /feedback/:id/restore', () => {
    it('returns ok when feedback is restored', async () => {
      (mockDatabaseHandler.restoreFeedback as jest.Mock).mockResolvedValueOnce(
        1,
      );

      const response = await request(app).patch('/feedback/1/restore');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        status: 'ok',
        message: 'Feedback restored',
      });
      expect(mockDatabaseHandler.restoreFeedback).toHaveBeenCalledWith(1);
    });

    it('returns 404 when feedback is not found', async () => {
      (mockDatabaseHandler.restoreFeedback as jest.Mock).mockResolvedValueOnce(
        0,
      );

      const response = await request(app).patch('/feedback/99/restore');

      expect(response.status).toEqual(404);
      expect(mockDatabaseHandler.restoreFeedback).toHaveBeenCalledWith(99);
    });

    it('returns 400 for a non-numeric id', async () => {
      const response = await request(app).patch('/feedback/abc/restore');

      expect(response.status).toEqual(400);
      expect(mockDatabaseHandler.restoreFeedback).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /feedback/:id', () => {
    it('returns ok when feedback is removed', async () => {
      (mockDatabaseHandler.removeFeedback as jest.Mock).mockResolvedValueOnce(
        1,
      );

      const response = await request(app).delete('/feedback/1');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        status: 'ok',
        message: 'Feedback removed',
      });
      expect(mockDatabaseHandler.removeFeedback).toHaveBeenCalledWith(1);
    });

    it('returns 404 when feedback is not found', async () => {
      (mockDatabaseHandler.removeFeedback as jest.Mock).mockResolvedValueOnce(
        0,
      );

      const response = await request(app).delete('/feedback/99');

      expect(response.status).toEqual(404);
      expect(mockDatabaseHandler.removeFeedback).toHaveBeenCalledWith(99);
    });

    it('returns 400 for a non-numeric id', async () => {
      const response = await request(app).delete('/feedback/abc');

      expect(response.status).toEqual(400);
      expect(mockDatabaseHandler.removeFeedback).not.toHaveBeenCalled();
    });
  });
});
