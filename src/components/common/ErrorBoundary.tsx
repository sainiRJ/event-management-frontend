import React from "react";
import {AlertTriangle, RefreshCw} from "lucide-react";

interface ErrorBoundaryProps {
	children: React.ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {hasError: false, error: null};
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return {hasError: true, error};
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// eslint-disable-next-line no-console
		console.error("Unhandled UI error:", error, errorInfo);
	}

	handleReload = () => {
		this.setState({hasError: false, error: null});
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen flex items-center justify-center bg-cream-100 p-6">
					<div className="glass-card max-w-md w-full p-8 text-center">
						<div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-5">
							<AlertTriangle className="w-7 h-7 text-brand-600" />
						</div>
						<h2 className="font-display text-xl font-semibold text-ink-900 mb-2">
							Something went wrong
						</h2>
						<p className="text-sm text-[#8A7A81] mb-6">
							This page ran into an unexpected error. Reloading usually fixes
							it. If it keeps happening, please contact support.
						</p>
						<button
							onClick={this.handleReload}
							className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-all"
						>
							<RefreshCw className="w-4 h-4" />
							Reload page
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
