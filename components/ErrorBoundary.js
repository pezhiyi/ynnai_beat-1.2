import React from 'react';
import Layout from './Layout/Layout';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Layout>
          <div className="error-container">
            <h1>出现了一些问题</h1>
            <p>抱歉，应用程序遇到了错误。请刷新页面重试。</p>
          </div>
        </Layout>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 