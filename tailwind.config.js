/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
	theme: {
		extend: {
			fontFamily: {
				serif: ["Fraunces", "Georgia", "serif"],
				sans: ["Manrope", "system-ui", "sans-serif"],
			},
			colors: {
				brand: {
					50: "#FBF0F3",
					100: "#F5DCE3",
					200: "#EBB9C8",
					300: "#DE8FA7",
					400: "#C95E82",
					500: "#A23C5C",
					600: "#8A3050",
					700: "#7D2C46",
					800: "#5E2035",
					900: "#3F1524",
				},
				cream: {
					50: "#FDFBF8",
					100: "#FAF6F1",
					200: "#F3ECE3",
				},
			},
			boxShadow: {
				glass: "0 8px 30px -14px rgba(162,60,92,0.18)",
				"glass-lg": "0 20px 50px -20px rgba(162,60,92,0.25)",
			},
			backdropBlur: {
				xs: "2px",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};
