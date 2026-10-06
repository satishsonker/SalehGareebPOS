import React from 'react';
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import ErrorBoundary from './ErrorBoundary';

describe('ErrorBoundary', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('shows a friendly fallback when a child component crashes', () => {
    const Bomb = () => {
      throw new Error('Boom');
    };

    const root = ReactDOM.createRoot(container);

    act(() => {
      root.render(
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      );
    });

    expect(container.textContent).toContain('Something went wrong');
    expect(container.textContent).toContain('Please refresh the page or try again');
  });
});
