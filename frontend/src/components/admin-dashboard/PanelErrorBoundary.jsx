import React from "react";

class PanelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error("Panel render error:", error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="chart-card" style={{ marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, color: "#C23B21", fontSize: "0.95rem" }}>
            {this.props.title || "Panel error"}
          </h3>
          <p style={{ marginTop: "0.5rem", marginBottom: "1rem", color: "#666", fontSize: "0.8rem" }}>
            {String(this.state.error || "Unexpected panel failure")}
          </p>
          <button onClick={this.handleReset} className="table-action-btn secondary">
            Retry Panel
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PanelErrorBoundary;
