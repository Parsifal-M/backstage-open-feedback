# Permissions — Old Frontend System

## Available Permissions

All permissions are exported from `@parsifal-m/backstage-plugin-open-feedback-common`:

| Permission | String ID | Controls |
|---|---|---|
| `openFeedbackPageReadPermission` | `open.feedback.page.read` | Access to the feedback page |
| `openFeedbackPageDeletePermission` | `open.feedback.page.delete` | Delete button on feedback cards |
| `openFeedbackArchivePermission` | `open.feedback.archive` | Archive and Restore buttons on feedback cards |
| `openFeedbackCreatePermission` | `open.feedback.create` | Submitting new feedback |

## Gating the Feedback Page

Use `RequirePermission` from `@backstage/plugin-permission-react` to restrict access to the feedback page to users with the `openFeedbackPageReadPermission` permission:

```tsx
import { RequirePermission } from '@backstage/plugin-permission-react';
import { openFeedbackPageReadPermission } from '@parsifal-m/backstage-plugin-open-feedback-common';

<Route
  path="/open-feedback"
  element={
    <RequirePermission permission={openFeedbackPageReadPermission}>
      <OpenFeedbackPage />
    </RequirePermission>
  }
/>
```

Users who don't have the permission will see a "Permission denied" page instead.

The Delete, Archive, and Restore buttons inside the page are already gated by the plugin itself using `usePermission` — no extra wiring needed for those.
