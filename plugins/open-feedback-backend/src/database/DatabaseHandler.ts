import {
  resolvePackagePath,
  PluginDatabaseManager,
} from '@backstage/backend-common';
import { Knex } from 'knex';
import {
  AppFeedback,
  SubmitFeedback,
} from '@parsifal-m/backstage-plugin-open-feedback-common';

const migrationsDir = resolvePackagePath(
  '@parsifal-m/backstage-plugin-open-feedback-backend',
  'migrations',
);

export class OpenFeedbackDatabaseHandler {
  private readonly client: Knex;
  static async create(
    database: PluginDatabaseManager,
  ): Promise<OpenFeedbackDatabaseHandler> {
    const client = await database.getClient();

    await client.migrate.latest({
      directory: migrationsDir,
    });

    return new OpenFeedbackDatabaseHandler(client);
  }

  private constructor(client: Knex) {
    this.client = client;
  }

  async addFeedback(feedback: SubmitFeedback): Promise<void> {
    await this.client('open_feedback').insert(feedback);
  }

  async getFeedback(): Promise<AppFeedback[]> {
    return this.client('open_feedback').select(
      'id',
      'url',
      'userRef',
      'rating',
      'comment',
      'created_at',
    );
  }

  async removeFeedback(id: number): Promise<void> {
    return this.client('open_feedback').where('id', id).delete();
  }
}
