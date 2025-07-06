// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Navbar, Nav, Button, Dropdown, Whisper, IconButton, Drawer, Divider } from "rsuite";
// import AdminIcon from "@rsuite/icons/Admin";
// import NoticeIcon from "@rsuite/icons/Notice";
// import MenuIcon from "@rsuite/icons/Menu";
// import SendToDashboardIcon from "@rsuite/icons/SendToDashboard";
// import PeoplesIcon from "@rsuite/icons/Peoples";
// import TrendIcon from "@rsuite/icons/Trend";
// import { ClipboardIcon } from "@radix-ui/react-icons";
// import HeaderPopover from "../HeaderPopover/HeaderPopover";
// import "./Header.css";

// const HeaderTab = () => {
// 	const navigate = useNavigate();
// 	const [showMobileMenu, setShowMobileMenu] = useState(false);

// 	const handleLogout = () => {
// 		localStorage.clear();
// 		navigate("/login");
// 	};

// 	const handleNavigation = (path: string) => {
// 		navigate(path);
// 		setShowMobileMenu(false);
// 	};

// 	return (
// 		<>
// 			<Navbar className="custom-navbar">
// 				<Navbar.Brand href="#" className="brand-logo">
// 					Decoration Admin
// 				</Navbar.Brand>
// 				<Nav pullRight className="desktop-nav">
// 					<Whisper
// 						placement="bottomEnd"
// 						trigger="click"
// 						controlId="profile-popover"
// 						preventOverflow
// 						speaker={<HeaderPopover arrow={false} />}
// 					>
// 						<Nav.Item icon={<NoticeIcon />}></Nav.Item>
// 					</Whisper>
// 					<Dropdown
// 						title={
// 							<span className="profile-dropdown">
// 								<AdminIcon /> Profile
// 							</span>
// 						}
// 						noCaret
// 						placement="bottomEnd"
// 					>
// 						<Dropdown.Item>Account Settings</Dropdown.Item>
// 						<Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
// 					</Dropdown>
// 				</Nav>
// 				<IconButton
// 					icon={<MenuIcon />}
// 					appearance="subtle"
// 					className="mobile-menu-button"
// 					onClick={() => setShowMobileMenu(true)}
// 				/>
// 			</Navbar>

// 			<Drawer
// 				open={showMobileMenu}
// 				onClose={() => setShowMobileMenu(false)}
// 				placement="left"
// 				size="xs"
// 				className="mobile-drawer"
// 			>
// 				<Drawer.Header>
// 					<IconButton
// 						icon={<MenuIcon />}
// 						appearance="subtle"
// 						className="close-button"
// 						onClick={() => setShowMobileMenu(false)}
// 					/>
// 				</Drawer.Header>
// 				<Drawer.Body>
// 					<Nav vertical>
// 						<Nav.Item
// 							icon={<SendToDashboardIcon />}
// 							onClick={() => handleNavigation("/dashboard")}
// 						>
// 							Dashboard
// 						</Nav.Item>
// 						<Nav.Item
// 							icon={<PeoplesIcon />}
// 							onClick={() => handleNavigation("/employees")}
// 						>
// 							Employees
// 						</Nav.Item>
// 						<Nav.Item
// 							icon={<ClipboardIcon />}
// 							onClick={() => handleNavigation("/booking")}
// 						>
// 							Booking
// 						</Nav.Item>
// 						<Nav.Item
// 							icon={<TrendIcon />}
// 							onClick={() => handleNavigation("/finance")}
// 						>
// 							Finance
// 						</Nav.Item>
// 						<Divider />
// 						<Nav.Item icon={<NoticeIcon />}>Notifications</Nav.Item>
// 						<Nav.Item icon={<AdminIcon />}>Profile</Nav.Item>
// 						<Nav.Item>Account Settings</Nav.Item>
// 						<Nav.Item onClick={handleLogout}>Logout</Nav.Item>
// 					</Nav>
// 				</Drawer.Body>
// 			</Drawer>
// 		</>
// 	);
// };

// export default HeaderTab;

import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {
	Menu,
	X,
	Bell,
	User,
	Home,
	Users,
	ClipboardList,
	TrendingUp,
} from "lucide-react"; // Optional: Lucide for icons

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
			<header className="bg-[#C09C3C] px-8 py-3 shadow-md fixed top-0 left-0 right-0 z-50 flex justify-between items-center">
				<a href="#" className="text-white text-xl font-semibold">
					Decoration Admin
				</a>
				<nav className="hidden md:flex items-center space-x-6">
					<button className="text-white hover:text-gray-200">
						<Bell className="w-5 h-5" />
					</button>
					<div className="relative group">
						<button className="text-white flex items-center space-x-2">
							<User className="w-5 h-5" />
							<span>Profile</span>
						</button>
						<div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
							<div className="py-1">
								<button
									onClick={() => handleNavigation("/profile")}
									className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
								>
									Account Settings
								</button>
								<button
									onClick={handleLogout}
									className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
								>
									Logout
								</button>
							</div>
						</div>
					</div>
				</nav>
				<button
					className="md:hidden text-white"
					onClick={() => setShowMobileMenu(true)}
				>
					<Menu className="w-6 h-6" />
				</button>
			</header>

			{/* Mobile Drawer */}
			<div
				className={`fixed top-0 left-0 h-full w-64 bg-gray-100 z-50 transform ${
					showMobileMenu ? "translate-x-0" : "-translate-x-full"
				} transition-transform duration-300 ease-in-out`}
			>
				<div className="flex justify-end p-4 bg-[#764ba2] text-white">
					<button onClick={() => setShowMobileMenu(false)}>
						<X className="w-6 h-6" />
					</button>
				</div>
				<nav className="p-4 space-y-2">
					<button
						onClick={() => handleNavigation("/dashboard")}
						className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-200 rounded"
					>
						<Home className="w-5 h-5" />
						<span>Dashboard</span>
					</button>
					<button
						onClick={() => handleNavigation("/employees")}
						className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-200 rounded"
					>
						<Users className="w-5 h-5" />
						<span>Employees</span>
					</button>
					<button
						onClick={() => handleNavigation("/booking")}
						className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-200 rounded"
					>
						<ClipboardList className="w-5 h-5" />
						<span>Booking</span>
					</button>
					<button
						onClick={() => handleNavigation("/finance")}
						className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-200 rounded"
					>
						<TrendingUp className="w-5 h-5" />
						<span>Finance</span>
					</button>
					<hr className="my-2 border-gray-300" />
					<button className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-200 rounded">
						<Bell className="w-5 h-5" />
						<span>Notifications</span>
					</button>
					<button className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-200 rounded">
						<User className="w-5 h-5" />
						<span>Profile</span>
					</button>
					<button
						onClick={() => handleNavigation("/profile")}
						className="w-full px-4 py-2 hover:bg-gray-200 rounded text-left"
					>
						Account Settings
					</button>
					<button
						onClick={handleLogout}
						className="w-full px-4 py-2 hover:bg-gray-200 rounded text-left"
					>
						Logout
					</button>
				</nav>
			</div>

			{/* Overlay when drawer is open */}
			{showMobileMenu && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40"
					onClick={() => setShowMobileMenu(false)}
				/>
			)}
		</>
	);
};

export default HeaderTab;
