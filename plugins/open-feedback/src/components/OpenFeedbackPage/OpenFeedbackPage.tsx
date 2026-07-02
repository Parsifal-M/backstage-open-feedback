import { Grid } from '@material-ui/core';
import { Content } from '@backstage/core-components';
import { FeedbackCards } from '../OpenFeedbackCard/OpenFeedbackCard';

export const ActiveFeedbackContent = () => (
  <Content>
    <Grid container spacing={3}>
      <FeedbackCards mode="active" />
    </Grid>
  </Content>
);

export const ArchivedFeedbackContent = () => (
  <Content>
    <Grid container spacing={3}>
      <FeedbackCards mode="archived" />
    </Grid>
  </Content>
);
