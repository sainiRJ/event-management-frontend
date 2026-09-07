import React from "react";

/** Logo assets, copied from the customer site's public/media/brand. */
export const BRAND_MARK = "/media/brand/logo-mark-120.png";
export const BRAND_LOGO = "/media/brand/logo-800.png";

interface iBrandLogoProps {
	/** Mark only, for the collapsed rail. */
	isCompact?: boolean;
	/** Light text for dark backgrounds. */
	isOnDark?: boolean;
	className?: string;
}

const BrandLogo: React.FC<iBrandLogoProps> = ({
	isCompact = false,
	isOnDark = false,
	className = "",
}) => {
	return (
		<span className={`inline-flex items-center gap-2.5 ${className}`}>
			<img
				src={BRAND_MARK}
				alt=""
				className="h-9 w-auto shrink-0"
				width={40}
				height={34}
			/>
			{!isCompact && (
				<span
					className={`whitespace-nowrap font-display text-lg font-semibold tracking-tight ${
						isOnDark ? "text-white" : "text-brand-700"
					}`}
				>
					Saini{" "}
					<span className={isOnDark ? "text-gold-300" : "text-gold-600"}>
						Events
					</span>
				</span>
			)}
		</span>
	);
};

export default BrandLogo;
