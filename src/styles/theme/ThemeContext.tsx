/**
 *  NOTE: The implementation of this ThemeContext is heavily inspired by
 *  the article given below. Kindly refer it for more details.
 *  https://medium.com/supercharges-mobile-product-guide/reactive-styles-in-react-native-79a41fbdc404
 */
import React from "react";

import {themeIds, defaultThemeId} from "../../constants/ThemeConstants";
import {iProvidedValue, iTheme} from "../../customTypes/ThemeTypes";

import DefaultLightTheme from "./DefaultLightTheme";

/**
 * All available themes should be registered here.
 *
 * NOTE: They should also be registered under ThemeConstants.themeIds first.
 */
const availableThemes: {
	[key in string]: iTheme;
} = {
	[themeIds.defaultLightTheme]: DefaultLightTheme,
};

/**
 * Creating the Context for ThemeProvider.
 *
 * NOTE: The defined Context Object here is only received by the
 * consumer components when there is no rendered context provider
 * in the view hierarchy, so it will provide only a fallback object.
 */
const Context = React.createContext<iProvidedValue>({
	theme: DefaultLightTheme,

	changeTheme: () => {
		console.warn("Theme provider is not rendered!");
	},
});

/**
 * Props for the stateful context provider.
 */
interface iProps {
	initialThemeId: string;

	children?: React.ReactNode;
}

/**
 * The stateful context provider for providing theme context.
 */
const ThemeProvider = React.memo<iProps>(
	({initialThemeId, children = null}: iProps) => {
		/**
		 * Storing the actual theme as an internal state of the ThemeProvider.
		 */
		const [selectedThemeId, setSelectedThemeId] =
			React.useState<string>(initialThemeId);

		/**
		 * Creating the changeTheme callback for changing the theme.
		 */
		const ChangeThemeCallback = React.useCallback((themeId?: string) => {
			if (
				themeId &&
				themeId.length > 0 &&
				Object.prototype.hasOwnProperty.call(availableThemes, themeId)
			) {
				setSelectedThemeId(themeId);
			} else {
				setSelectedThemeId(defaultThemeId);
			}
		}, []);

		/**
		 * Building the provided object.
		 */
		const MemoizedValue = React.useMemo(() => {
			const value: iProvidedValue = {
				theme: availableThemes[selectedThemeId],
				changeTheme: ChangeThemeCallback,
			};

			return value;
		}, [selectedThemeId, ChangeThemeCallback]);

		/**
		 * Render the context provider by passing the value to provide.
		 */
		return (
			<Context.Provider value={MemoizedValue}>{children}</Context.Provider>
		);
	},
);

ThemeProvider.displayName = "ThemeProvider";

/**
 * Custom context consumer hook for functional components
 * @returns
 */
const useTheme = () => {
	return React.useContext(Context);
};

export {ThemeProvider, useTheme};
