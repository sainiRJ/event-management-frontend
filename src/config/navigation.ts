import {
	CalendarCheck,
	CalendarDays,
	ClipboardList,
	Contact,
	History,
	Images,
	Inbox,
	LayoutDashboard,
	LucideIcon,
	MessagesSquare,
	MessageSquare,
	Package,
	Settings,
	Star,
	Sunrise,
	TrendingUp,
	Users,
} from "lucide-react";

import {ROLES} from "./roles";

export interface iNavItem {
	label: string;
	icon: LucideIcon;
	path: string;
	/** Which unread counter, if any, drives this item's badge. */
	badge?: "bookingRequests" | "contactMessages";
	/** Shown to staff accounts as well as owners. Defaults to owners only. */
	isStaffVisible?: boolean;
}

export interface iNavGroup {
	/** Shown above the group on wide screens; omitted for the first group. */
	heading?: string;
	items: iNavItem[];
}

/**
 * One source of truth for navigation, used by both the desktop sidebar and
 * the mobile drawer — so a new screen appears in both without being added
 * twice.
 *
 * Grouped by what the vendor is actually doing: today's work, the things
 * waiting on a reply, and the setup that rarely changes.
 */
export const navigation: iNavGroup[] = [
	{
		items: [
			{label: "Today", icon: Sunrise, path: "/today", isStaffVisible: true},
			{label: "Dashboard", icon: LayoutDashboard, path: "/dashboard"},
			{
				label: "Calendar",
				icon: CalendarDays,
				path: "/calendar",
				isStaffVisible: true,
			},
			{
				label: "Bookings",
				icon: ClipboardList,
				path: "/booking",
				isStaffVisible: true,
			},
			{label: "Customers", icon: Contact, path: "/customers"},
		],
	},
	{
		heading: "Waiting on you",
		items: [
			{
				label: "Requests",
				icon: Inbox,
				path: "/booking-requests",
				badge: "bookingRequests",
			},
			{
				label: "Enquiries",
				icon: MessageSquare,
				path: "/enquiries",
				badge: "contactMessages",
			},
			{label: "Conversations", icon: MessagesSquare, path: "/conversations"},
		],
	},
	{
		heading: "Your business",
		items: [
			{label: "Finance", icon: TrendingUp, path: "/finance"},
			{label: "Employees", icon: Users, path: "/employees"},
			{
				label: "Attendance",
				icon: CalendarCheck,
				path: "/attendance",
				isStaffVisible: true,
			},
			{label: "Services", icon: Settings, path: "/services"},
			{label: "Packages", icon: Package, path: "/packages"},
			{label: "Gallery", icon: Images, path: "/gallery"},
			{label: "Reviews", icon: Star, path: "/reviews"},
			{label: "Activity", icon: History, path: "/activity"},
		],
	},
];

export const allNavItems: iNavItem[] = navigation.flatMap((group) => {
	return group.items;
});

/** The groups a given role should see, with empty groups dropped. */
export function navigationForRole(role: string | null): iNavGroup[] {
	const isStaff = role === ROLES.EMPLOYEE;
	if (!isStaff) return navigation;

	return navigation
		.map((group) => {
			return {
				...group,
				items: group.items.filter((item) => {
					return item.isStaffVisible;
				}),
			};
		})
		.filter((group) => {
			return group.items.length > 0;
		});
}
