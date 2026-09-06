import React, {useEffect, useRef, useState} from "react";
import {
	motion,
	useReducedMotion,
	type HTMLMotionProps,
	type Variants,
} from "framer-motion";

/**
 * Motion primitives for the dashboard.
 *
 * Four things, and only four: a reveal on mount/scroll, a staggered reveal
 * of siblings, a page cross-fade, and a number that counts up. Timings live
 * here so the whole app moves at one speed. Every primitive is a no-op
 * under `prefers-reduced-motion`.
 */

export const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
	hidden: {opacity: 0, y: 14},
	show: {opacity: 1, y: 0, transition: {duration: 0.45, ease: EASE}},
};

export const scaleIn: Variants = {
	hidden: {opacity: 0, scale: 0.97},
	show: {opacity: 1, scale: 1, transition: {duration: 0.4, ease: EASE}},
};

type RevealProps = HTMLMotionProps<"div"> & {
	variant?: Variants;
	delay?: number;
	/** Play when scrolled into view (default) or immediately on mount. */
	onMount?: boolean;
	as?: "div" | "section" | "li" | "article";
};

export function Reveal({
	variant = fadeUp,
	delay = 0,
	onMount = false,
	as = "div",
	children,
	...rest
}: RevealProps): React.ReactElement {
	const prefersReduced = useReducedMotion();
	const Tag = motion[as] as typeof motion.div;

	if (prefersReduced) {
		return <Tag {...rest}>{children}</Tag>;
	}

	return (
		<Tag
			variants={variant}
			initial="hidden"
			{...(onMount
				? {animate: "show"}
				: {whileInView: "show", viewport: {once: true, amount: 0.15}})}
			transition={{delay}}
			{...rest}
		>
			{children}
		</Tag>
	);
}

type StaggerProps = HTMLMotionProps<"div"> & {
	stagger?: number;
	delay?: number;
	as?: "div" | "ul" | "ol" | "section";
};

export function Stagger({
	stagger = 0.06,
	delay = 0.03,
	as = "div",
	children,
	...rest
}: StaggerProps): React.ReactElement {
	const prefersReduced = useReducedMotion();
	const Tag = motion[as] as typeof motion.div;

	if (prefersReduced) {
		return <Tag {...rest}>{children}</Tag>;
	}

	return (
		<Tag
			variants={{
				hidden: {},
				show: {transition: {staggerChildren: stagger, delayChildren: delay}},
			}}
			initial="hidden"
			animate="show"
			{...rest}
		>
			{children}
		</Tag>
	);
}

type StaggerItemProps = HTMLMotionProps<"div"> & {
	variant?: Variants;
	as?: "div" | "li" | "article";
};

export function StaggerItem({
	variant = fadeUp,
	as = "div",
	children,
	...rest
}: StaggerItemProps): React.ReactElement {
	const Tag = motion[as] as typeof motion.div;
	return (
		<Tag variants={variant} {...rest}>
			{children}
		</Tag>
	);
}

/** Cross-fades route content. Key it by pathname. */
export function PageTransition({
	children,
}: {
	children: React.ReactNode;
}): React.ReactElement {
	const prefersReduced = useReducedMotion();

	if (prefersReduced) {
		return <>{children}</>;
	}

	return (
		<motion.div
			initial={{opacity: 0, y: 8}}
			animate={{opacity: 1, y: 0}}
			transition={{duration: 0.35, ease: EASE}}
		>
			{children}
		</motion.div>
	);
}

/**
 * Counts from 0 to `value` once, formatted by `format`. Reduced motion, or
 * a value that is not a finite number, renders the final value straight away.
 */
export function CountUp({
	value,
	duration = 0.9,
	format = (n: number): string => Math.round(n).toLocaleString("en-IN"),
	className,
}: {
	value: number;
	duration?: number;
	format?: (n: number) => string;
	className?: string;
}): React.ReactElement {
	const prefersReduced = useReducedMotion();
	const [shown, setShown] = useState(prefersReduced ? value : 0);
	const frame = useRef<number | null>(null);

	useEffect(() => {
		if (prefersReduced || !Number.isFinite(value)) {
			setShown(value);
			return;
		}

		const start = performance.now();
		const from = 0;

		const tick = (now: number): void => {
			const t = Math.min(1, (now - start) / (duration * 1000));
			/* ease-out cubic */
			const eased = 1 - Math.pow(1 - t, 3);
			setShown(from + (value - from) * eased);
			if (t < 1) {
				frame.current = requestAnimationFrame(tick);
			}
		};

		frame.current = requestAnimationFrame(tick);

		return () => {
			if (frame.current !== null) cancelAnimationFrame(frame.current);
		};
	}, [value, duration, prefersReduced]);

	return <span className={className}>{format(shown)}</span>;
}
