import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Cập nhật state để hiển thị fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Ghi log lỗi ra console
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" style={{ padding: "20px", backgroundColor: "#ffeeee", borderRadius: "8px", textAlign: "center" }}>
          <h2>Đã xảy ra lỗi</h2>
          <p>Đã có lỗi xảy ra khi tải trang này. Vui lòng thử lại sau.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Tải lại trang
          </button>
          <details style={{ marginTop: "20px", textAlign: "left" }}>
            <summary>Chi tiết lỗi</summary>
            <pre style={{ whiteSpace: "pre-wrap", color: "red" }}>
              {this.state.error && this.state.error.toString()}
            </pre>
            <pre style={{ whiteSpace: "pre-wrap", color: "#666" }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;