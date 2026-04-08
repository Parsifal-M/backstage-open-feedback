import { useState } from 'react';
import { Grid } from '@material-ui/core';
import { Header, Page, RoutedTabs } from '@backstage/core-components';
import { FeedbackCards } from '../OpenFeedbackCard/OpenFeedbackCard';
import { ArchivedFeedbackCards } from '../ArchivedFeedbackCard';

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
                  <ArchivedFeedbackCards refreshKey={archiveRefreshKey} />
                </Grid>
              ),
            },
          ]}
        />
    </Page>
  );
};
