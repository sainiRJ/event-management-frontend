import React from "react";

import SidebarNav from "../SidebarNav/SidebarNav";

const SidebarUI: React.FC = () => {
	const [expanded, setExpand] = React.useState(true);
	const [activeKey, setActiveKey] = React.useState("1");
	const [openKeys, setOpenKeys] = React.useState(["3", "4"]);
	return (
		<SidebarNav
			activeKey={activeKey}
			openKeys={openKeys}
			onSelect={setActiveKey}
			onOpenChange={setOpenKeys}
			expanded={expanded}
			onExpand={setExpand}
		/>
	);
};

export default SidebarUI;
