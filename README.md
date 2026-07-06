# OpenFeedback Plugin for Backstage

Hello! :wave:

OpenFeedback is a simple plugin for [Backstage](https://backstage.io/) that lets your users submit feedback from within your portal — and gives administrators a central place to view, archive, and manage it.

> [!WARNING]
> **Breaking change — v1.0.0 and above requires the New Frontend System.**
> The `OpenFeedbackPage` component and `openFeedbackPlugin` named exports have been removed. The plugin now ships as a New Frontend System plugin only and must be used with `@backstage/frontend-defaults` (or any NFS-compatible Backstage app). If you are still on the old frontend system, stay on `v0.x`.

## Key Features

- **Feedback modal** — a sidebar button that opens a dialog for users to submit feedback as themselves or anonymously
- **Feedback page** — an admin view showing all submitted feedback as cards, with archive and delete actions
- **Archive & restore** — move feedback out of the active view without permanently deleting it; restore it any time
- **Permissions** — fine-grained control over who can read, submit, archive, and delete feedback

## Screenshots

### Feedback Modal

![OpenFeedbackModal](./docs/img/of-modal.png)

### Feedback Page

![OpenFeedbackPage](./docs/img/of-feedback.png)

## Installation

From the root of your Backstage repository:

```bash
yarn --cwd packages/app add @parsifal-m/backstage-plugin-open-feedback
yarn --cwd packages/backend add @parsifal-m/backstage-plugin-open-feedback-backend
```

## Backend Setup

Add the backend plugin to `packages/backend/src/index.ts`:

```typescript
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

backend.add(import('@parsifal-m/backstage-plugin-open-feedback-backend'));

backend.start();
```

## Frontend Setup

Add the plugin to your app's feature list in `packages/app/src/App.tsx`:

```typescript
import { createApp } from '@backstage/frontend-defaults';
import openFeedbackPlugin from '@parsifal-m/backstage-plugin-open-feedback';

const app = createApp({
  features: [
    // ... other plugins
    openFeedbackPlugin,
  ],
});

export default app.createRoot();
```

The feedback page is mounted at `/open-feedback` by default (with sub-routes `/open-feedback/active` and `/open-feedback/archived`). You can override the path and title via `app-config.yaml`: 

```yaml
app:
  extensions:
    - page:open-feedback:
        config:
          path: /my-feedback # optional, defaults to /open-feedback
          title: Team Feedback # optional, defaults to "Open Feedback"
```

## Adding the Feedback Modal

Add `OpenFeedbackModal` to your sidebar in `packages/app/src/components/Root/Root.tsx`:

```typescript
import { OpenFeedbackModal } from '@parsifal-m/backstage-plugin-open-feedback';

<Sidebar>
  {/* ... */}
  <OpenFeedbackModal />
</Sidebar>
```

The component accepts optional props to customise its appearance and behaviour — see the [source](./plugins/open-feedback/src/components/OpenFeedbackModal) for the full list.

## Permissions

OpenFeedback ships with four permissions: read, submit, archive, and delete. The UI buttons are already gated — no extra wiring needed for basic use.

See [docs/permissions.md](./docs/permissions.md) for the full reference, backend policy wiring, and how to conditionally hide the nav item.

## Contributing

Contributions are welcome! Feel free to pick up any open issues or suggest new features by opening one.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details. You can also reach me on Mastodon at [@parcifal](https://hachyderm.io/@parcifal).
