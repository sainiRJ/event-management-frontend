import React, {forwardRef, RefObject} from "react";
import {Popover, Button, Dropdown} from "rsuite";

interface iHeaderPopoverProps {
	title?: string;
	arrow?: boolean;
}

/**
 * HeaderPopover component renders a popover with additional actions.
 * @param {iHeaderPopoverProps} props - Props for the HeaderPopover component.
 * @param {React.Ref<HTMLDivElement>} ref - Reference to the root element of the component.
 * @returns {React.ReactElement} HeaderPopover component.
 */
const HeaderPopover: React.FC<iHeaderPopoverProps> = forwardRef<
	HTMLDivElement,
	iHeaderPopoverProps
>(function HeaderPopover({title, ...rest}: iHeaderPopoverProps, ref) {
	return (
		<Popover
			{...rest}
			ref={ref as RefObject<HTMLDivElement>}
			title={title || ""}
			style={{
				width: "200px", // Set width of the Popover to ensure buttons expand to full width
			}}
		></Popover>
	);
});

export default HeaderPopover;
