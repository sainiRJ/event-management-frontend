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
			padding-top: 60px; /* Account for fixed header */

			@media (max-width: 768px) {
				display: none;
			}
		`,
		sideNavStyles: css`
			height: auto;
			width: 50px;
			box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
			transition: all 0.3s ease;
			border-top-left-radius: 15px;
			border-bottom-left-radius: 15px;
			overflow: hidden;
			background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
			border: 1px solid rgba(0, 0, 0, 0.1);

			&:hover {
				width: 200px;
				box-shadow: 0 0 25px rgba(0, 0, 0, 0.15);
			}

			.rs-sidenav-body {
				padding: 1rem 0;
			}

			.rs-nav-item {
				padding: 0.8rem 1rem;
				display: flex;
				align-items: center;
				color: #333;
				transition: all 0.2s ease;
				border-radius: 8px;
				margin: 0.2rem 0.5rem;

				&:hover {
					background-color: #f0f2f5;
					color: #764ba2;
				}

				&.rs-nav-item-active {
					background-color: #764ba2;
					color: white;
				}
			}

			.rs-icon {
				margin-right: 12px;
				font-size: 1.2rem;
			}

			.rs-sidenav-toggle {
				position: absolute;
				bottom: 20px;
				right: 10px;
			}

			@media (max-width: 768px) {
				width: 100%;
				border-radius: 0;
				height: 100vh;
				position: fixed;
				top: 60px;
				right: 0;
			}
		`,
	});
};

export default Style;
