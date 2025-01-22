/** @jsxImportSource @emotion/react */
import {css} from "@emotion/react";

import {createStyles} from "../../customTypes/StyleTypes";

const Style = () => {
	return createStyles({
		wrapper: css`
			position: fixed;
			top: 0;
			right: 0;
			height: 100vh;
			display: flex;
			align-items: center;
			z-index: 9000;
		`,
		sideNavStyles: css`
			height: auto;
			width: 50px;
			box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
			transition: width 0.3s ease, box-shadow 0.3s ease;
			border-top-left-radius: 15px;
			border-bottom-left-radius: 15px;
			overflow: hidden;
			border: 0.4px solid #ffffff;

			&:hover {
				box-shadow: 0 0 25px rgba(0, 0, 0, 0.15);
			}

			.rs-sidenav-body {
				padding-top: 10px;
			}

			.rs-nav-item {
				font-size: 14px;
				font-text: #ffffff;
			}

			.rs-nav-item:hover {
				background-color: #e6e6e6;
				cursor: pointer;
			}

			.rs-icon {
				margin-right: 5px;
			}

			.rs-sidenav-toggle {
				position: absolute;
				bottom: 20px;
				right: 10px;
			}
		`,
	});
};

export default Style;
