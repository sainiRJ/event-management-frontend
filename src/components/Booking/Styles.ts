/** @jsxImportSource @emotion/react */
import {css} from "@emotion/react";

import {createStyles} from "../../customTypes/StyleTypes";

const Style = () => {
	return createStyles({
		wrapper: css`
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 20px;
			background-color: #f4f7fc;
			min-height: 100vh;
			width: 100%;
		`,
		container: css`
			max-width: 1200px;
			width: 100%;
			display: flex;
			flex-direction: column;
			gap: 30px;
		`,
		addNewBooking: css`
			background-color: #ffffff;
			padding: 20px;
			border-radius: 8px;
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		`,
		bookingTable: css`
			background-color: #ffffff;
			padding: 20px;
			border-radius: 8px;
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
			overflow-x: auto;
		`,
		responsive: css`
			@media (max-width: 768px) {
				.container {
					padding: 10px;
				}
				.addNewBooking,
				.bookingTable {
					padding: 15px;
				}
			}
		`,
	});
};

export default Style;
