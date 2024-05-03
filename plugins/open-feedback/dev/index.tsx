import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { openFeedbackPlugin, OpenFeedbackPage } from '../src/plugin';

createDevApp()
  .registerPlugin(openFeedbackPlugin)
  .addPage({
    element: <OpenFeedbackPage />,
    title: 'Root Page',
    path: '/open-feedback',
  })
  .render();
