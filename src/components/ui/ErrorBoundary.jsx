import { Component } from 'react';

/**
 * Top-level error boundary.
 * Keeps a rendering bug in one section from blanking the whole storefront.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // In production this is where you'd forward to Sentry / a logger.
    console.error('Unexpected render error:', error, info);
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;

    if (!error) return children;

    return (
      <div role="alert" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Kuch gadbad ho gayi :(
        </h1>
        <p style={{ color: 'var(--c-text-muted)', marginBottom: '1.5rem' }}>
          Page refresh kar ke dekhein. Agar phir bhi issue rahe to humein bataayein.
        </p>
        <button
          type="button"
          className="btn btn--primary btn--md"
          onClick={() => window.location.reload()}
        >
          <span className="btn__label">Page refresh karein</span>
        </button>
      </div>
    );
  }
}