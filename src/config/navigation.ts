import {
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
	Settings,
	TrendingUp,
	Users,
} from "lucide-react";

export interface iNavItem {
	label: string;
	icon: LucideIcon;
	path: string;
	/** Which unread counter, if any, drives this item's badge. */
	badge?: "bookingRequests" | "contactMessages";
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
			{label: "Dashboard", icon: LayoutDashboard, path: "/dashboard"},
			{label: "Calendar", icon: CalendarDays, path: "/calendar"},
			{label: "Bookings", icon: ClipboardList, path: "/booking"},
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
			{label: "Services", icon: Settings, path: "/services"},
			{label: "Gallery", icon: Images, path: "/gallery"},
			{label: "Activity", icon: History, path: "/activity"},
		],
	},
];

export const allNavItems: iNavItem[] = navigation.flatMap((group) => {
	return group.items;
});
