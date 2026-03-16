import { BrowserRouter } from 'react-router-dom';
import Routes from './Routes';
import './App.css';
import '@shopify/polaris-viz/build/esm/styles.css';

import { AppBridgeProvider, QueryProvider, PolarisProvider } from './components';
import { PolarisVizProvider } from '@shopify/polaris-viz';
import { AppDataProvider } from './context/AppDataContext';
import Navigation from './Navigation';

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager('./pages/**/!(*.test.[jt]sx)*.([jt]sx)');

  return (
    <PolarisProvider>
      <PolarisVizProvider>
        <QueryProvider>
          <AppDataProvider>
            <BrowserRouter>
              <AppBridgeProvider>
                <Navigation />
                <Routes pages={pages} />
              </AppBridgeProvider>
            </BrowserRouter>
          </AppDataProvider>
        </QueryProvider>
      </PolarisVizProvider>
    </PolarisProvider>
  );
}

