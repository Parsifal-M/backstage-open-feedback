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
  userRef: string;
  rating: number;
  comment: string;
};

export type SubmitFeedback = Omit<AppFeedback, 'id'>;

// Exporting the permissions from the permissions folder
export * from './permissions';
