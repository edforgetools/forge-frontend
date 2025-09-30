import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from "react";
import { logEvent } from "../lib/logEvent";
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        logEvent("react_error", {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        });
    }
    render() {
        if (this.state.hasError) {
            return (_jsxs("div", { className: "p-4 text-center", children: [_jsx("h2", { className: "text-xl font-bold text-red-500 mb-2", children: "Something went wrong" }), _jsx("p", { className: "text-gray-600 mb-4", children: "An error occurred while rendering the application." }), _jsx("button", { className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", onClick: () => this.setState({ hasError: false, error: undefined }), children: "Try again" })] }));
        }
        return this.props.children;
    }
}
