# OpenFeedback Plugin for Backstage

OpenFeedback is a plugin for [Backstage](https://backstage.io/) designed to simplify the process of collecting and managing feedback within your Backstage application, for your Backstage application. It's composed of several components, including a backend, frontend, and common utilities.

## Key Features

- **Feedback Collection**: OpenFeedback provides two interfaces for users to easily submit feedback, helping you gather valuable insights to improve your application.

  - **OpenFeedbackModal**: This component can be added to the sidebar and pops up a dialog box for users to send feedback. It can be easily integrated into your `packages/app/src/components/Root/Root.tsx` file.
  - **OpenFeedbackForm**: This is a form component that can be added to any page (More specifically designed for the [Backstage HomePage](https://backstage.io/docs/getting-started/homepage/#homepage)), providing a flexible way to collect feedback across your application.

- **Feedback Management**: The `OpenFeedbackPage` component provides a comprehensive view of all collected feedback. This page uses the `FeedbackCards` component to display each piece of feedback. Administrators can view all feedback collected from users on this page, making it a central hub for feedback management.

- **Integrated Solution**: OpenFeedback is built to integrate seamlessly with Backstage, allowing you to manage feedback directly within your Backstage application.

## Components

- `backend`: This component, located in the `plugins/open-feedback-backend` directory, handles data processing and storage, ensuring that feedback data is securely stored and readily accessible.

- `frontend`: This component, located in the `plugins/open-feedback` directory, provides the user interface for collecting and managing feedback. It includes the OpenFeedbackModal and OpenFeedbackForm components for flexible feedback collection.

- `common`: This component, located in the `plugins/open-feedback-common` directory, contains shared types and permissions used by both the backend and frontend.
