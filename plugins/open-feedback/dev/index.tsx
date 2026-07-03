import ReactDOM from 'react-dom/client';
import { createApp } from '@backstage/frontend-defaults';
import openFeedbackPlugin from '../src/plugin';

ReactDOM.createRoot(document.getElementById('root')!).render(
  createApp({ features: [openFeedbackPlugin] }).createRoot(),
);
