import React from "react";
import {Link} from "react-router-dom";
import {Compass} from "lucide-react";
import Button from "../ui/Button";

/**
 * Rendered for any route that doesn't match — previously an unmatched path
 * (e.g. a stale link) rendered nothing at all.
 */
const NotFoundPage: React.FC = () => {
	return (
		<div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
			<div className="w-16 h-16 rounded-2xl bg-brand-50 border border-ink-200 flex items-center justify-center mb-6">
				<Compass className="w-8 h-8 text-brand-500" />
			</div>
			<h1 className="text-2xl font-display font-semibold text-ink-900 mb-2">
				Page not found
			</h1>
			<p className="text-sm text-ink-500 mb-8 max-w-sm">
				The page you&rsquo;re looking for doesn&rsquo;t exist or may have been
				moved.
			</p>
			<Link to="/dashboard">
				<Button variant="primary">Back to Dashboard</Button>
			</Link>
		</div>
	);
};

export default NotFoundPage;
