import { resolvePackagePath } from '@backstage/backend-common';
import { Knex } from 'knex';
import {
  AppFeedback,
  SubmitFeedback,
} from '@parsifal-m/backstage-plugin-open-feedback-common';

const migrationsDir = resolvePackagePath(
  '@parsifal-m/backstage-plugin-open-feedback-backend',
  'migrations',
);

type Options = {
  database: Knex;
};

export class DatabaseHandler {
  static async create(options: Options): Promise<DatabaseHandler> {
    const { database } = options;

    await database.migrate.latest({
      directory: migrationsDir,
    });

    return new DatabaseHandler(options);
  }

  private readonly database: Knex;

  private constructor(options: Options) {
    this.database = options.database;
  }

  async addFeedback(feedback: SubmitFeedback): Promise<void> {
    await this.database('open_feedback').insert(feedback);
  }

  async getFeedback(): Promise<AppFeedback[]> {
    return this.database('open_feedback').select(
      'id',
      'userRef',
      'rating',
      'comment',
      'created_at',
    );
  }

  async removeFeedback(id: number): Promise<void> {
    return this.database('open_feedback').where('id', id).delete();
  }
}
