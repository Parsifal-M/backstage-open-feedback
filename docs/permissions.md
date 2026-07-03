# Permissions

OpenFeedback ships with four permissions that control who can read, delete, archive, and submit feedback. All are exported from `@parsifal-m/backstage-plugin-open-feedback-common`.

| Permission                         | String ID                   | Controls                                      |
| ---------------------------------- | --------------------------- | --------------------------------------------- |
| `openFeedbackPageReadPermission`   | `open.feedback.page.read`   | Viewing feedback on the feedback page         |
| `openFeedbackPageDeletePermission` | `open.feedback.page.delete` | Delete button on feedback cards               |
| `openFeedbackArchivePermission`    | `open.feedback.archive`     | Archive and Restore buttons on feedback cards |
| `openFeedbackCreatePermission`     | `open.feedback.create`      | Submitting new feedback via the modal         |

## What the plugin gates itself

The Delete, Archive, and Restore buttons inside the feedback cards are already gated using `usePermission` internally — no extra wiring needed for those.

The feedback page content (both the Active and Archived tabs) is gated by `openFeedbackPageReadPermission` inside the plugin. Users who lack this permission will see a "Permission denied" message when they navigate to either tab.

## Wiring up the permission backend

To enforce permissions, add a permission policy to your backend. Below is a minimal example that allows all users to read feedback and only users with the `admin` role to delete or archive it.

```typescript
// packages/backend/src/plugins/permission.ts
import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  PolicyDecision,
  AuthorizeResult,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import {
  openFeedbackPageReadPermission,
  openFeedbackPageDeletePermission,
  openFeedbackArchivePermission,
  openFeedbackCreatePermission,
} from '@parsifal-m/backstage-plugin-open-feedback-common';

class OpenFeedbackPermissionPolicy implements PermissionPolicy {
  async handle(
    request: { permission: { name: string } },
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    // Allow anyone to read and submit feedback
    if (
      request.permission.name === openFeedbackPageReadPermission.name ||
      request.permission.name === openFeedbackCreatePermission.name
    ) {
      return { result: AuthorizeResult.ALLOW };
    }

    // Gate delete and archive to admins only
    if (
      request.permission.name === openFeedbackPageDeletePermission.name ||
      request.permission.name === openFeedbackArchivePermission.name
    ) {
      const isAdmin = user?.info.ownershipEntityRefs.includes(
        'group:default/admins',
      );
      return {
        result: isAdmin ? AuthorizeResult.ALLOW : AuthorizeResult.DENY,
      };
    }

    return { result: AuthorizeResult.ALLOW };
  }
}

export default createBackendModule({
  pluginId: 'permission',
  moduleId: 'open-feedback-policy',
  register(reg) {
    reg.registerInit({
      deps: { policy: policyExtensionPoint },
      async init({ policy }) {
        policy.setPolicy(new OpenFeedbackPermissionPolicy());
      },
    });
  },
});
```

Then add the module to your backend:

```typescript
// packages/backend/src/index.ts
backend.add(import('./plugins/permission'));
```

## Gating the feedback page nav item

If you want to hide the feedback page nav item entirely for users without the read permission, you can override the `NavContentBlueprint` extension and conditionally render the sidebar item using `usePermission`:

```tsx
import { usePermission } from '@backstage/plugin-permission-react';
import { openFeedbackPageReadPermission } from '@parsifal-m/backstage-plugin-open-feedback-common';

// Inside your NavContentBlueprint component:
const { allowed } = usePermission({
  permission: openFeedbackPageReadPermission,
});

// Then conditionally render:
{
  allowed && nav.take('page:open-feedback');
}
```
