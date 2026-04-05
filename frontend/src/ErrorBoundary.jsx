import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
          <h1 style={{ marginBottom: 16 }}>Something went wrong</h1>
          <p style={{ marginBottom: 12 }}>The application encountered an error while rendering.</p>
          <div style={{
            background: '#f8fafc',
            padding: 18,
            borderRadius: 12,
            border: '1px solid rgba(148, 163, 184, 0.4)',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.4,
          }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>Error:</strong>
            <div style={{ marginBottom: 12 }}>{String(this.state.error)}</div>
            {this.state.info && (
              <>
                <strong style={{ display: 'block', marginBottom: 8 }}>Component stack:</strong>
                <div>{String(this.state.info.componentStack)}</div>
              </>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
