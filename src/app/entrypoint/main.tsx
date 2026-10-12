import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { SkeletonTheme } from 'react-loading-skeleton';
import { Provider as ReduxProvider } from 'react-redux';

import { queryClient } from 'app/providers/queryClient';
import { store } from 'app/providers/store/store';
import { skeletonTheme } from 'app/styles/skeletonTheme';

import { App } from '../App';
import { DialogProvider } from '../providers/dialog/DialogProvider';

import 'normalize.css';
import '../styles/index.scss';
import 'react-loading-skeleton/dist/skeleton.css';

const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <DialogProvider>
        <QueryClientProvider client={queryClient}>
          <SkeletonTheme
            baseColor={skeletonTheme.baseColor}
            highlightColor={skeletonTheme.highlightColor}
            borderRadius={skeletonTheme.borderRadius}
            duration={skeletonTheme.duration}
            customHighlightBackground={skeletonTheme.customHighlightBackground}
          >
            <App />
          </SkeletonTheme>
        </QueryClientProvider>
      </DialogProvider>
    </ReduxProvider>
  </React.StrictMode>,
);

if ('serviceWorker' in navigator && 'PushManager' in window) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('Service Worker успешно зарегистрирован!', reg.scope))
      .catch((err) => console.error('Ошибка регистрации Service Worker:', err));
  });
}
