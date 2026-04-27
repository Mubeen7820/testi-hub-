import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import React from "react";

// Emergency Error Boundary for debugging blank screen
class GlobalErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("GLOBAL CRASH:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#fff', color: '#000', fontFamily: 'sans-serif' }}>
          <h1>Something went wrong during startup.</h1>
          <pre style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <GlobalErrorBoundary>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </GlobalErrorBoundary>
);
