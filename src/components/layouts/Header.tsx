import React from "react";

import {Navbar, Nav, Button, Dropdown, Whisper} from "rsuite";
import AdminIcon from "@rsuite/icons/Admin";
import NoticeIcon from "@rsuite/icons/Notice";
import HeaderPopover from "../HeaderPopover/HeaderPopover";
import "./Header.css";
const HeaderTab = () => (
	<>
		<Navbar className="custom-navbar">
			<Navbar.Brand href="#">RSUITE</Navbar.Brand>
			<Nav pullRight>
				<Whisper
					placement="bottomEnd"
					trigger="click"
					controlId="profile-popover"
					preventOverflow
					speaker={<HeaderPopover arrow={false} />}
				>
					<Nav.Item icon={<NoticeIcon />}></Nav.Item>
				</Whisper>
				<Dropdown
					title={
						<span>
							<AdminIcon /> Profile
						</span>
					}
					noCaret
					placement="bottomEnd"
				>
					<Dropdown.Item> Account Settings</Dropdown.Item>
					<Dropdown.Item>Logout</Dropdown.Item>
				</Dropdown>
			</Nav>
		</Navbar>
	</>
);

export default HeaderTab;
