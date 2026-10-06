import React, { act } from 'react';
import ReactDOM from 'react-dom/client';
import {
  ApiLoaderProvider,
  useApiLoader,
  notifyApiRequestStart,
  notifyApiRequestEnd,
} from './ApiLoaderContext';

describe('ApiLoaderProvider', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('shows loader while a request is active and hides it after the request ends', () => {
    const TestComponent = () => {
      const { isLoading } = useApiLoader();
      return <div>{isLoading ? 'loading' : 'idle'}</div>;
    };

    const root = ReactDOM.createRoot(container);

    act(() => {
      root.render(
        <ApiLoaderProvider>
          <TestComponent />
        </ApiLoaderProvider>
      );
    });

    expect(container.textContent).toContain('idle');

    act(() => {
      notifyApiRequestStart();
    });

    expect(container.textContent).toContain('loading');

    act(() => {
      notifyApiRequestEnd();
    });

    expect(container.textContent).toContain('idle');
  });
});
