import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Button, Dropdown, Whisper, IconButton, Drawer, Divider } from "rsuite";
import AdminIcon from "@rsuite/icons/Admin";
import NoticeIcon from "@rsuite/icons/Notice";
import MenuIcon from "@rsuite/icons/Menu";
import SendToDashboardIcon from "@rsuite/icons/SendToDashboard";
import PeoplesIcon from "@rsuite/icons/Peoples";
import TrendIcon from "@rsuite/icons/Trend";
import { ClipboardIcon } from "@radix-ui/react-icons";
import HeaderPopover from "../HeaderPopover/HeaderPopover";
import "./Header.css";

const HeaderTab = () => {
	const navigate = useNavigate();
	const [showMobileMenu, setShowMobileMenu] = useState(false);

	const handleLogout = () => {
		localStorage.clear();
		navigate("/login"); 
	};

	const handleNavigation = (path: string) => {
		navigate(path);
		setShowMobileMenu(false);
	};

	return (
		<>
			<Navbar className="custom-navbar">
				<Navbar.Brand href="#" className="brand-logo">
					Decoration Admin
				</Navbar.Brand>
				<Nav pullRight className="desktop-nav">
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
							<span className="profile-dropdown">
								<AdminIcon /> Profile
							</span>
						}
						noCaret
						placement="bottomEnd"
					>
						<Dropdown.Item>Account Settings</Dropdown.Item>
						<Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
					</Dropdown>
				</Nav>
				<IconButton
					icon={<MenuIcon />}
					appearance="subtle"
					className="mobile-menu-button"
					onClick={() => setShowMobileMenu(true)}
				/>
			</Navbar>

			<Drawer
				open={showMobileMenu}
				onClose={() => setShowMobileMenu(false)}
				placement="left"
				size="xs"
				className="mobile-drawer"
			>
				<Drawer.Header>
					<IconButton
						icon={<MenuIcon />}
						appearance="subtle"
						className="close-button"
						onClick={() => setShowMobileMenu(false)}
					/>
				</Drawer.Header>
				<Drawer.Body>
					<Nav vertical>
						<Nav.Item 
							icon={<SendToDashboardIcon />}
							onClick={() => handleNavigation("/dashboard")}
						>
							Dashboard
						</Nav.Item>
						<Nav.Item 
							icon={<PeoplesIcon />}
							onClick={() => handleNavigation("/employees")}
						>
							Employees
						</Nav.Item>
						<Nav.Item 
							icon={<ClipboardIcon />}
							onClick={() => handleNavigation("/booking")}
						>
							Booking
						</Nav.Item>
						<Nav.Item 
							icon={<TrendIcon />}
							onClick={() => handleNavigation("/finance")}
						>
							Finance
						</Nav.Item>
						<Divider />
						<Nav.Item icon={<NoticeIcon />}>Notifications</Nav.Item>
						<Nav.Item icon={<AdminIcon />}>Profile</Nav.Item>
						<Nav.Item>Account Settings</Nav.Item>
						<Nav.Item onClick={handleLogout}>Logout</Nav.Item>
					</Nav>
				</Drawer.Body>
			</Drawer>
		</>
	);
};

export default HeaderTab;
