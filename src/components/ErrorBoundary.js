import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container} role="alert" aria-live="assertive">
          <div style={styles.card}>
            <div style={styles.icon}>⚠️</div>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.message}>
              We hit a problem while loading this page. Please refresh the page or try again in a moment.
            </p>
            <button type="button" onClick={this.handleRetry} style={styles.button}>
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '24px',
    background: '#f8fafc',
    fontFamily: 'sans-serif',
    color: '#0f172a',
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
    padding: '32px 24px',
    textAlign: 'center',
  },
  icon: {
    fontSize: '42px',
    marginBottom: '12px',
  },
  title: {
    margin: '0 0 12px',
    fontSize: '28px',
    fontWeight: 700,
  },
  message: {
    margin: '0 0 20px',
    fontSize: '16px',
    lineHeight: 1.6,
    color: '#475569',
  },
  button: {
    border: 'none',
    borderRadius: '10px',
    background: '#2563eb',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600,
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
};

export default ErrorBoundary;
