import { Component } from "react";

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Keep this log for debugging unexpected runtime crashes in demo environments.
    console.error("ShopFlow render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-[40vh] place-items-center rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <div>
            <p className="text-lg font-semibold text-rose-200">Something went wrong on this page</p>
            <p className="mt-2 text-sm text-rose-100/80">
              Refresh the page to recover. The app now prevents route-level blank screens.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default AppErrorBoundary;
