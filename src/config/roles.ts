/**
 * Role names as they arrive in the JWT. The backend decides what each role
 * may do; this list only shapes what the console shows.
 */
export const ROLES = {
	VENDOR: "vendor",
	ADMIN: "admin",
	EMPLOYEE: "employee",
} as const;

/** Owners: everything. */
export const VENDOR_ROLES: string[] = [ROLES.VENDOR, ROLES.ADMIN];

/** Owners plus staff: the day-of-event screens. */
export const STAFF_ROLES: string[] = [...VENDOR_ROLES, ROLES.EMPLOYEE];
