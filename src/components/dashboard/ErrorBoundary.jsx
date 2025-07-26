import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    if (this.props.onError) this.props.onError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-900 text-red-200 rounded-xl shadow-xl max-w-xl mx-auto mt-16">
          <h2 className="text-2xl font-bold mb-4">Something went wrong.</h2>
          <pre className="text-xs whitespace-pre-wrap mb-2">{this.state.error && this.state.error.toString()}</pre>
          <details className="text-xs whitespace-pre-wrap">
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button className="mt-4 px-4 py-2 bg-accent text-black rounded" onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
