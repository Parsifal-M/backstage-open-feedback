import { Grid } from '@material-ui/core';
import { Content } from '@backstage/core-components';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { openFeedbackPageReadPermission } from '@parsifal-m/backstage-plugin-open-feedback-common';
import { FeedbackCards } from '../OpenFeedbackCard/OpenFeedbackCard';

export const ActiveFeedbackContent = () => (
  <RequirePermission permission={openFeedbackPageReadPermission}>
    <Content>
      <Grid container spacing={3}>
        <FeedbackCards mode="active" />
      </Grid>
    </Content>
  </RequirePermission>
);

export const ArchivedFeedbackContent = () => (
  <RequirePermission permission={openFeedbackPageReadPermission}>
    <Content>
      <Grid container spacing={3}>
        <FeedbackCards mode="archived" />
      </Grid>
    </Content>
  </RequirePermission>
);
