import { TestDatabases } from '@backstage/backend-test-utils';
import { Knex } from 'knex';
import { OpenFeedbackDatabaseHandler } from './DatabaseHandler';

const databases = TestDatabases.create({ disableDocker: false, ids: ['POSTGRES_16'] });

describe.each(databases.eachSupportedId())(
  'OpenFeedbackDatabaseHandler %s',
  databaseId => {
    let db: Knex;
    let handler: OpenFeedbackDatabaseHandler;

    beforeAll(async () => {
      db = await databases.init(databaseId);

      const mockDatabaseManager = {
        getClient: jest.fn().mockResolvedValue(db),
      };

      handler = await OpenFeedbackDatabaseHandler.create(mockDatabaseManager);
    }, 60_000);

    beforeEach(async () => {
      await db('open_feedback').del();
    });

    it('should add feedback', async () => {
      const feedback = {
        userRef: 'test',
        url: 'test-url',
        rating: 5,
        comment: 'test comment',
      };

      await handler.addFeedback(feedback);

      const result = await db('open_feedback').select();
      expect(result).toHaveLength(1);
      expect({
        ...result[0],
        rating: parseFloat(result[0].rating),
      }).toMatchObject(feedback);
    });

    it('should get feedback', async () => {
      const feedback = {
        userRef: 'test',
        url: 'test-url',
        rating: 5,
        comment: 'test comment',
      };

      await handler.addFeedback(feedback);

      const result = await handler.getFeedback();
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
    });

    it('should remove feedback', async () => {
      const feedback = {
        userRef: 'test',
        url: 'test-url',
        rating: 5,
        comment: 'test comment',
      };

      await handler.addFeedback(feedback);

      let result = await handler.getFeedback();
      expect(result).toHaveLength(1);

      await handler.removeFeedback(result[0].id);

      result = await handler.getFeedback();
      expect(result).toHaveLength(0);
    });

    it('should archive feedback and exclude it from getFeedback', async () => {
      const feedback = {
        userRef: 'test',
        url: 'test-url',
        rating: 4,
        comment: 'archive me',
      };

      await handler.addFeedback(feedback);

      let active = await handler.getFeedback();
      expect(active).toHaveLength(1);
      const id = active[0].id;

      await handler.archiveFeedback(id);

      active = await handler.getFeedback();
      expect(active).toHaveLength(0);

      const archived = await handler.getArchivedFeedback();
      expect(archived).toHaveLength(1);
      expect(archived[0].archived).toBe(true);
    });

    it('should restore archived feedback back to active', async () => {
      const feedback = {
        userRef: 'test',
        url: 'test-url',
        rating: 2,
        comment: 'restore me',
      };

      await handler.addFeedback(feedback);
      const [item] = await handler.getFeedback();

      await handler.archiveFeedback(item.id);
      await handler.restoreFeedback(item.id);

      const active = await handler.getFeedback();
      expect(active).toHaveLength(1);
      expect(active[0].archived).toBe(false);

      const archived = await handler.getArchivedFeedback();
      expect(archived).toHaveLength(0);
    });

    it('should return only non-archived feedback from getFeedback', async () => {
      await handler.addFeedback({
        userRef: 'user1',
        url: 'url1',
        rating: 5,
        comment: 'active',
      });
      await handler.addFeedback({
        userRef: 'user2',
        url: 'url2',
        rating: 1,
        comment: 'archived',
      });

      const allActive = await handler.getFeedback();
      expect(allActive).toHaveLength(2);

      await handler.archiveFeedback(allActive[1].id);

      const active = await handler.getFeedback();
      expect(active).toHaveLength(1);
      expect(active[0].comment).toBe('active');
    });
  },
);
