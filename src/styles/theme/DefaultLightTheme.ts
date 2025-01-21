import Colors from "../../styles/Colors";
import {iColorTheme, iTheme} from "../../customTypes/ThemeTypes";

const colors: iColorTheme = {
	primary: Colors.BLUE_MARGUERITE,

	secondary: Colors.WHITE,

	accents: {
		first: Colors.STORM_GRAY,
	},

	neutrals: {
		background: {
			screen: Colors.WHITE,
			statusBar: Colors.ROYAL_BLUE,
			box: Colors.WHITE,
		},

		font: {
			heading: Colors.TUNA,

			paragraph: Colors.MANATE,

			highlight: Colors.CERULEAN_BLUE,

			info: Colors.CERULEAN_BLUE,

			label: Colors.CERULEAN_BLUE,
		},
	},

	semantic: {
		error: Colors.WHITE,

		warning: Colors.WHITE,

		success: Colors.WHITE,

		info: Colors.WHITE,
	},
};

const DefaultLightTheme: iTheme = {
	id: "default-light-theme",

	isDark: false,

	colors,
};

export default DefaultLightTheme;
