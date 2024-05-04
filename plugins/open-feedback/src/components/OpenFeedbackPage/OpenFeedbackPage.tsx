import React from 'react';
import { Typography, Grid, Box } from '@material-ui/core';
import {
  InfoCard,
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import { FeedbackCards } from '../OpenFeedbackCard/OpenFeedbackCard';
import { FeedbackForm } from '../OpenFeedbackForm/OpenFeedbackForm';

export const OpenFeedbackPage = () => (
  <Page themeId="tool">
    <Header title="Welcome to OpenFeedback!" subtitle="Collected Feedback for your Backstage App!">
      <HeaderLabel label="Owner" value="Team X" />
      <HeaderLabel label="Lifecycle" value="Alpha" />
    </Header>
    <Content>
      <ContentHeader title="">
        <SupportButton>A description of your plugin goes here.</SupportButton>
      </ContentHeader>
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