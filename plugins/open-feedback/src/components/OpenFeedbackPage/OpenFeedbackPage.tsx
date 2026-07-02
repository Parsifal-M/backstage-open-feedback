import { useState } from 'react';
import { Grid } from '@material-ui/core';
import { Content, Header, Page, RoutedTabs } from '@backstage/core-components';
import { FeedbackCards } from '../OpenFeedbackCard/OpenFeedbackCard';

export interface OpenFeedbackPageProps {
  title?: string;
  subtitle?: string;
}

export const OpenFeedbackPage = ({
  title = 'Welcome to OpenFeedback!',
  subtitle = 'Collected Feedback for your Backstage App!',
}: OpenFeedbackPageProps) => {
  const [archiveRefreshKey, setArchiveRefreshKey] = useState(0);

  return (
    <Page themeId="tool">
      <Header title={title} subtitle={subtitle} />
      <RoutedTabs
        routes={[
          {
            path: '/',
            title: 'Active',
            children: (
              <Grid container spacing={3}>
                <FeedbackCards
                  mode="active"
                  onArchive={() => setArchiveRefreshKey(k => k + 1)}
                />
              </Grid>
            ),
          },
          {
            path: '/archived',
            title: 'Archived',
            children: (
              <Grid container spacing={3}>
                <FeedbackCards mode="archived" refreshKey={archiveRefreshKey} />
              </Grid>
            ),
          },
        ]}
      />
    </Page>
  );
};

// NFS sub-page content — no page shell, framework provides PluginHeader + tabs.
// Sub-pages re-mount on tab switch so no cross-tab refresh state is needed.
export const NfsActiveFeedbackContent = () => (
  <Content>
    <Grid container spacing={3}>
      <FeedbackCards mode="active" />
    </Grid>
  </Content>
);

export const NfsArchivedFeedbackContent = () => (
  <Content>
    <Grid container spacing={3}>
      <FeedbackCards mode="archived" />
    </Grid>
  </Content>
);
