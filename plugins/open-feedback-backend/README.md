# OpenFeedback Backend

This plugin serves as the backend for OpenFeedback.

## Adding the OpenFeedback Backend to your Backstage Application

To add the OpenFeedback backend to your Backstage application, you need to add the following code to your `packages/backend/src/plugins/index.ts` file:

```typescript
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// Other plugins
backend.add(import('@parsifal-m/backstage-plugin-open-feedback-backend'));

backend.start();
```
