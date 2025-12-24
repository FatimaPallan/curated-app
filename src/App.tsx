import { Analytics } from '@vercel/analytics/react';
import CuratedPage from './CuratedPage';
import { ANALYTICS_ENABLED } from './config';

export default function App() {
  return (
    <>
      <CuratedPage />
      {ANALYTICS_ENABLED && <Analytics />}
    </>
  );
}

