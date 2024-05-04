# OpenFeedback Frontend

This is the frontend for OpenFeedback.

## Adding the OpenFeedback Frontend to your Backstage Application

Firstly you will want to add the `OpenFeedbackPage` component to your `packages/app/src/App.tsx` file under the `routes`. This will add the feedback page to your Backstage application.

In the `OpenFeedbackPage` you will be able to see all the feedback that has been collected from users, and you will also have the option to delete feedback if needed.

> Note: If you want to use the `OpenFeedbackModal` component, you will need to add it also like below.

```typescript
const routes = (
  <FlatRoutes>
    // Other routes
    <Route path="/open-feedback" element={<OpenFeedbackPage />} />
    <Route path="/open-feedback-modal" element={<OpenFeedbackModal />} />
  </FlatRoutes>
);
```

## Using the OpenFeedbackModal Component

To use the `OpenFeedbackModal` component, you will need to add it to your `packages/app/src/components/Root/Root.tsx` file. This will add the feedback modal to your Backstage application, personally I like to add it under the search button, or above/with the user settings button.

Clicking on it will open a dialog box for users to send feedback.

```typescript
import { OpenFeedbackModal } from '@parsifal-m/backstage-plugin-open-feedback';

// Inside your Root component
<Sidebar>
  {/* Other SidebarItems */}
  <SidebarItem
    icon={ThumbUpAltIcon}
    to="/open-feedback-modal"
    text="OpenFeedbackModal"
  />
  {/* Other SidebarItems */}
</Sidebar>;
```

## Using the OpenFeedbackForm Component

I would recommend using the `OpenFeedbackForm` on the [Backstage HomePage](https://backstage.io/docs/getting-started/homepage/#homepage) to collect feedback from users. This component can be added to any page, but it is more specifically designed for the Backstage HomePage.
