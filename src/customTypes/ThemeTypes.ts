import {ColorValue} from "@/customTypes/CommonTypes";

export interface iNeutrals {
	background: {
		screen: ColorValue;
		statusBar: ColorValue;
		box: ColorValue;
	};

	font: {
		heading: ColorValue;

		paragraph: ColorValue;

		highlight: ColorValue;

		info: ColorValue;

		label: ColorValue;
	};
}

export interface iAccentColors {
	first: ColorValue;
}

export interface iSemanticColors {
	error: ColorValue;

	warning: ColorValue;

	success: ColorValue;

	info: ColorValue;
}

export interface iColorTheme {
	primary: ColorValue;

	secondary: ColorValue;

	accents: iAccentColors;

	neutrals: iNeutrals;

	semantic: iSemanticColors;
}

export interface iTheme {
	id: string;

	isDark: boolean;

	colors: iColorTheme;
}

export interface iProvidedValue {
	theme: iTheme;

	changeTheme: (themeId?: string) => void;
}
