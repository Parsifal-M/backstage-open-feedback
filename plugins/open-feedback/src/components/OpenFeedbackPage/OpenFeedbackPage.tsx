import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import { InfoCard, Header, Page, Content } from '@backstage/core-components';
import { FeedbackCards } from '../OpenFeedbackCard/OpenFeedbackCard';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

export const OpenFeedbackPage = () => {
  const configApi = useApi(configApiRef);
  const appTitle = configApi.getOptionalString('app.title') ?? 'Backstage';

  return (
    <Page themeId="tool">
      <Header
        title="Welcome to OpenFeedback!"
        subtitle={`Collected Feedback for your ${appTitle} App!`}
      />
      <Content>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <InfoCard title="Collected Feedback">
              <Typography variant="body1">
                The feedback collected from your users will be displayed below.
              </Typography>
            </InfoCard>
          </Grid>
          <FeedbackCards />
        </Grid>
      </Content>
    </Page>
  );
};
