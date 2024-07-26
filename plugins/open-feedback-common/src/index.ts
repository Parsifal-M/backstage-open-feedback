/***/
/**
 * Common functionalities for the open-feedback plugin.
 *
 * @packageDocumentation
 */

/**
 * In this package you might for example declare types that are common
 * between the frontend and backend plugin packages.
 */
export type AppFeedback = {
  id: number;
  url?: string;
  userRef: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type SubmitFeedback = Omit<AppFeedback, 'id' | 'created_at'>;

// Exporting the permissions from the permissions folder
export * from './permissions';
