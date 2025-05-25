/** @jsxRuntime classic */
/** @jsx jsx */

import {jsx} from "@emotion/react";
import {Sidenav, Nav} from "rsuite";
import {Icon} from "@rsuite/icons";
import SendToDashboardIcon from "@rsuite/icons/SendToDashboard";
import PeoplesIcon from "@rsuite/icons/Peoples";
import TrendIcon from "@rsuite/icons/Trend";
import {ClipboardIcon} from "@radix-ui/react-icons";
import {Tooltip, Whisper} from "rsuite";
import {Link} from "react-router-dom"; // Import Link from React Router
import GearCircleIcon from "@rsuite/icons/legacy/GearCircle";

import {useThemeAwareObject} from "../../styles/theme/ThemingHelper";

import Styles from "./Styles";

const CustomSideNav = () => {
	const styles = useThemeAwareObject(Styles);

	return (
		<div css={styles.wrapper}>
			<div css={styles.sideNavStyles}>
				<Sidenav appearance="subtle">
					<Sidenav.Body>
						<Nav>
							<Whisper
								placement="left"
								trigger="hover"
								speaker={<Tooltip>Dashboard</Tooltip>}
							>
								<Nav.Item
									as={Link}
									to="/dashboard"
									eventKey="1"
									icon={<Icon as={SendToDashboardIcon} />}
								>
									Dashboard
								</Nav.Item>
							</Whisper>
							<Whisper
								placement="left"
								trigger="hover"
								speaker={<Tooltip>Services</Tooltip>}
							>
								<Nav.Item
									as={Link}
									to="/services"
									eventKey="1"
									icon={<Icon as={GearCircleIcon} />}
								>
									Services
								</Nav.Item>
							</Whisper>
							<Whisper
								placement="left"
								trigger="hover"
								speaker={<Tooltip>Employees</Tooltip>}
							>
								<Nav.Item
									as={Link}
									to="/employees"
									eventKey="2"
									icon={<Icon as={PeoplesIcon} />}
								>
									Employees
								</Nav.Item>
							</Whisper>
							<Whisper
								placement="left"
								trigger="hover"
								speaker={<Tooltip>Booking</Tooltip>}
							>
								<Nav.Item
									as={Link}
									to="/booking"
									eventKey="3"
									icon={<Icon as={ClipboardIcon} />}
								>
									Booking
								</Nav.Item>
							</Whisper>
							<Whisper
								placement="left"
								trigger="hover"
								speaker={<Tooltip>Finance</Tooltip>}
							>
								<Nav.Item
									as={Link}
									to="/finance"
									eventKey="4"
									icon={<Icon as={TrendIcon} />}
								>
									Finance
								</Nav.Item>
							</Whisper>
						</Nav>
					</Sidenav.Body>
				</Sidenav>
			</div>
		</div>
	);
};
export default CustomSideNav;
