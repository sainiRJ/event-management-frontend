import React from "react";

import {iTheme} from "../../customTypes/ThemeTypes";

import {useTheme} from "./ThemeContext";

/**
 * A type alias for the generator function.
 * NOTE: It should match the form of "createStyles"
 * function in the functional components.
 */
type Generator<T extends object> = (props: iTheme) => T;

/**
 * Custom hook for creating theme aware StyleSheet object.
 *
 * @param fn
 * @returns
 */
const useThemeAwareObject = <T extends object>(
	fn: Generator<T>,
	orientation?: string,
) => {
	/**
	 * Consuming the provided value of the them context.
	 */
	const {theme} = useTheme();

	/**
	 * Generating the object based on the current selected theme.
	 */
	const ThemeAwareObject = React.useMemo(() => {
		return fn(theme);
	}, [fn, theme, orientation]);

	return ThemeAwareObject;
};

export {useThemeAwareObject};
