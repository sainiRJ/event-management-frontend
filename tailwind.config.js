import tailwindcssAnimate from "tailwindcss-animate";

/**
 * Design tokens for the admin dashboard.
 *
 * `brand` is the logo maroon, so every existing `brand-*` class across the
 * dashboard picks up the real brand without being touched. `gold` is the
 * accent from the logo, used sparingly: active states, highlights, the odd
 * number that matters. Neutrals are warm so the two sites read as one.
 */

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
	theme: {
		extend: {
			fontFamily: {
				display: ["Playfair Display", "Georgia", "serif"],
				serif: ["Playfair Display", "Georgia", "serif"],
				sans: ["Manrope", "system-ui", "sans-serif"],
			},
			colors: {
				brand: {
					50: "#FCF1F2",
					100: "#F7DCDF",
					200: "#EFB5BC",
					300: "#DF7E8A",
					400: "#C64A5C",
					500: "#A92338",
					600: "#8B0E1F",
					700: "#6A0A18",
					800: "#4A0711",
					900: "#2B040A",
				},
				gold: {
					50: "#FBF6EA",
					100: "#F5EACB",
					200: "#EBD79B",
					300: "#E4C77A",
					400: "#D6B25B",
					500: "#C9A24B",
					600: "#A8843A",
					700: "#83662C",
					800: "#5C471E",
					900: "#362A11",
				},
				ink: {
					50: "#FAF7F5",
					100: "#F3EDE9",
					200: "#E6DCD6",
					300: "#CDBFB6",
					400: "#A6958B",
					500: "#7C6B62",
					600: "#5A4B44",
					700: "#3E332E",
					800: "#27201D",
					900: "#171211",
				},
				cream: {
					50: "#FDFBF9",
					100: "#FAF7F5",
					200: "#F3EDE9",
				},
			},
			boxShadow: {
				soft: "0 1px 2px rgba(23,18,17,0.04), 0 8px 24px -12px rgba(23,18,17,0.12)",
				lift: "0 2px 4px rgba(23,18,17,0.05), 0 24px 48px -20px rgba(23,18,17,0.25)",
				glass: "0 8px 30px -14px rgba(139,14,31,0.16)",
				"glass-lg": "0 20px 50px -20px rgba(139,14,31,0.24)",
			},
			borderRadius: {
				"4xl": "2rem",
			},
			backdropBlur: {
				xs: "2px",
			},
			transitionTimingFunction: {
				premium: "cubic-bezier(0.22, 1, 0.36, 1)",
			},
			keyframes: {
				shimmer: {
					from: {backgroundPosition: "200% 0"},
					to: {backgroundPosition: "-200% 0"},
				},
			},
			animation: {
				shimmer: "shimmer 1.8s linear infinite",
			},
		},
	},
	plugins: [tailwindcssAnimate],
};
