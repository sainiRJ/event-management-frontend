/** @jsxRuntime classic */
/** @jsx jsx */

import {jsx} from "@emotion/react";
import {Sidenav, Nav} from "rsuite";
import {Icon} from "@rsuite/icons";
import SendToDashboardIcon from '@rsuite/icons/SendToDashboard';
import PeoplesIcon from '@rsuite/icons/Peoples';
import TrendIcon from '@rsuite/icons/Trend';
import {
	ReloadIcon,
	MixerHorizontalIcon,
	DesktopIcon,
	ClipboardIcon,
} from "@radix-ui/react-icons";
import {Tooltip, Whisper} from "rsuite";

import {useThemeAwareObject} from "../../styles/theme/ThemingHelper";

import Styles from "./Styles";

const CustomSideNav = () => {
	const styles = useThemeAwareObject(Styles);

	const projectUrl = `http://localhost:3000/#`;

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
									href={projectUrl}
									eventKey="1"
									icon={<Icon as={SendToDashboardIcon} />}
								>
									Project
								</Nav.Item>
							</Whisper>
							<Whisper
								placement="left"
								trigger="hover"
								speaker={<Tooltip>Employees</Tooltip>}
							>
								<Nav.Item
									href={projectUrl}
									eventKey="2"
									icon={<Icon as={PeoplesIcon} />}
								>
									Project
								</Nav.Item>
							</Whisper>
							<Whisper
								placement="left"
								trigger="hover"
								speaker={<Tooltip>Booking</Tooltip>}
							>
								<Nav.Item
									href={projectUrl}
									eventKey="3"
									icon={<Icon as={ClipboardIcon} />}
								>
									Project
								</Nav.Item>
							</Whisper>
							<Whisper
								placement="left"
								trigger="hover"
								speaker={<Tooltip>Finance module</Tooltip>}
							>
								<Nav.Item
									href={projectUrl}
									eventKey="4"
									icon={<Icon as={TrendIcon} />}
								>
									Project
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
