import { TestDatabases } from '@backstage/backend-test-utils';
import { Knex } from 'knex';
import { OpenFeedbackDatabaseHandler } from './DatabaseHandler';

const databases = TestDatabases.create();

describe('OpenFeedbackDatabaseHandler', () => {
  let db: Knex;
  let handler: OpenFeedbackDatabaseHandler;

  beforeAll(async () => {
    db = await databases.init('SQLITE_3');

    const mockDatabaseManager = {
      getClient: jest.fn().mockResolvedValue(db),
    };

    handler = await OpenFeedbackDatabaseHandler.create(mockDatabaseManager);
  });

  beforeEach(async () => {
    await db('open_feedback').del();
  });

  afterAll(async () => {
    await db.destroy();
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
});
