import moment from "moment-timezone";
import Decimal from "decimal.js";

import {
	iProjectTaskTimelogTableRowData,
	timelogEntriesByDateType,
} from "@/customTypes/appDataTypes/timeLogTypes";
import {
	DEFAULT_DATE_TIME_FORMAT,
	DATE_IN_TEXT_FORMAT,
} from "@/utils/DateTImeUtil";
import {NullableString} from "@/customTypes/CommonTypes";
import {
	iBugItem,
	iModuleItem,
	iProjectDetails,
	iTaskItem,
} from "@/customTypes/appDataTypes/projectTypes";
import {projectTaskTypes} from "@/constants/projectConstants";

const DEFAULT_TIMELOG_REPORT_TABLE_PAGE_SIZE = 50;
const DEFAULT_TIMELOG_REPORT_TABLE_PAGE_NUMBER = 1;
function getLastUpdatedOnAndBy(
	timelogEntriesByDate: timelogEntriesByDateType,
): {
	lastUpdatedOn: NullableString;
	lastUpdatedById: NullableString;
	lastUpdatedByName: NullableString;
} {
	let mLastUpdatedOn: moment.Moment | null = null;
	let lastUpdatedById: NullableString = "";
	let lastUpdatedByName: NullableString = "";

	Object.keys(timelogEntriesByDate).forEach((workDateKey) => {
		const timelogEntry = timelogEntriesByDate[workDateKey];

		const {updatedAt, loggedBy, loggedByName} = timelogEntry;

		if (updatedAt) {
			const mUpdatedAt = moment(updatedAt, DEFAULT_DATE_TIME_FORMAT);

			if (!mLastUpdatedOn) {
				mLastUpdatedOn = mUpdatedAt;
				lastUpdatedById = loggedBy;
				lastUpdatedByName = loggedByName;
			} else if (mUpdatedAt.isAfter(mLastUpdatedOn)) {
				mLastUpdatedOn = mUpdatedAt;
				lastUpdatedById = loggedBy;
				lastUpdatedByName = loggedByName;
			}
		}
	});

	let lastUpdatedOnFormatted: NullableString = null;

	if (mLastUpdatedOn !== null) {
		lastUpdatedOnFormatted = (mLastUpdatedOn as moment.Moment).format(
			DEFAULT_DATE_TIME_FORMAT,
		);
	}

	return {
		lastUpdatedOn: lastUpdatedOnFormatted,
		lastUpdatedById,
		lastUpdatedByName,
	};
}

/**
 * Generate dynamic label of selected date range for timelog reports table section.
 * @param {string} startDate - The start date of the selected range (in ISO 8601 format, e.g., "yyyy-mm-dd").
 * @param {string} endDate - The end date of the selected range (in ISO 8601 format, e.g., "yyyy-mm-dd").
 * @returns {string} The generated label based on the provided date range.
 * If the same whole month is selected (start date is the first day of the month and end date is the last day of the month),
 * the output will be the abbreviated month name followed by the year (e.g., "Apr 2024").
 * If a range spanning across multiple months is selected, the output will include both the start and end days along with their respective month and year
 * (e.g., "12 Apr 24 - 16 May 24").
 */
const generateTimelogReportsDurationTitle = (
	startDate: string,
	endDate: string,
) => {
	const start = new Date(startDate);
	const end = new Date(endDate);

	const startDay = start.getDate();
	const endDay = end.getDate();

	const startMonth = start.toLocaleString("default", {month: "short"});
	const endMonth = end.toLocaleString("default", {month: "short"});

	const startYear = start.getFullYear().toString().slice(-2);
	const endYear = end.getFullYear().toString().slice(-2);

	const isWholeMonth =
		start.getDate() === 1 &&
		end.getDate() ===
			new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();

	if (isWholeMonth && start.getMonth() === end.getMonth()) {
		return `${startMonth} ${start.getFullYear()}`;
	} else if (start.getFullYear() === end.getFullYear()) {
		return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
	} else {
		return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
	}
};

/**
 * Utility function to format logged date from "MM-DD-YYYY" to "ddd, MMM DD" format.
 * @param {string} loggedDate - The logged date string in "MM-DD-YYYY" format.
 * @returns {string} The formatted date string in "ddd, MMM DD" format.
 * @example
 * // Returns "Thu, Apr 18"
 * formatLoggedDate("04-18-2024");
 */
const numericDateToTextDate = (loggedDate: string) => {
	// Parse the logged date using moment.js
	const parsedDate = moment(loggedDate, "MM-DD-YYYY");
	// Format the parsed date as "ddd, MMM DD"
	const formattedDate = parsedDate.format(DATE_IN_TEXT_FORMAT);
	return formattedDate;
};

/**
 * Calculate the total planned hours by adding the planned billable hours
 * and planned write-off hours.
 *
 * @param {string} plannedBillableHours The planned billable hours.
 * @param {string} plannedWriteOffHours The planned write-off hours.
 * @returns {string} The total planned hours.
 */
const calculateTotalPlannedHours = (
	plannedBillableHours: string,
	plannedWriteOffHours: string,
): string => {
	const totalPlannedHours = new Decimal(plannedBillableHours)
		.plus(plannedWriteOffHours)
		.toString();
	return totalPlannedHours;
};

/**
 * Calculates the sum of time logs for child tasks.
 *
 * @param childrenIds - An array of child task IDs.
 * @param childTaskItems - A record of child task items.
 * @returns The sum of time logs for child tasks.
 */
function calculateSumOfChildTaskTimeLogs(
	childrenIds: string[],
	childTaskItems: Record<string, iTaskItem | iModuleItem>,
	childTaskItems2?: Record<string, iTaskItem | iBugItem>,
): number {
	let sum = 0;

	childrenIds.forEach((childTaskId) => {
		let childTask: iTaskItem | iModuleItem | iBugItem | null = null;

		if (childTaskItems[childTaskId]) {
			childTask = childTaskItems[childTaskId];
		} else if (childTaskItems2 && childTaskItems2[childTaskId]) {
			childTask = childTaskItems2[childTaskId];
		}

		if (childTask && childTask.totalTimeLog !== null) {
			sum += childTask.totalTimeLog;
		}
	});

	return sum;
}

/**
 * Calculates the total time log for the parent module and phase of a given child task.
 *
 * @param projectDetails - The project details object.
 * @param childTaskId - The ID of the child task.
 * @returns An object containing the total time log for the parent module and phase.
 */
function calculateParentTotalTimeLog(
	projectDetails: iProjectDetails,
	childTaskId: string,
): {
	moduleTotalTimeLog: null | {
		moduleId: string;
		totalTimeLog: number;
	};

	phaseTotalTimeLog: null | {
		phaseId: string;
		totalTimeLog: number;
	};
} {
	let childTaskDetails = null;

	if (projectDetails.tasks.items[childTaskId]) {
		childTaskDetails = projectDetails.tasks.items[childTaskId];
	} else if (projectDetails.modules.items[childTaskId]) {
		childTaskDetails = projectDetails.modules.items[childTaskId];
	}

	if (!childTaskDetails) {
		return {
			moduleTotalTimeLog: null,
			phaseTotalTimeLog: null,
		};
	}

	const {parentId: parentTaskId, type: childTaskType} = childTaskDetails;

	if (!parentTaskId) {
		return {
			moduleTotalTimeLog: null,
			phaseTotalTimeLog: null,
		};
	}

	let parentModuleDetails = null;
	let parentPhaseDetails = null;

	if (
		childTaskType === projectTaskTypes.TASK ||
		childTaskType === projectTaskTypes.BUG
	) {
		parentModuleDetails = projectDetails.modules.items[parentTaskId];
	} else if (childTaskType === projectTaskTypes.MODULE) {
		parentPhaseDetails = projectDetails.phases.items[parentTaskId];
	}

	if (!parentModuleDetails && !parentPhaseDetails) {
		return {
			moduleTotalTimeLog: null,
			phaseTotalTimeLog: null,
		};
	}

	let moduleTotalTimeLog = null;
	let phaseTotalTimeLog = null;

	if (parentModuleDetails) {
		const {childrenIds} = parentModuleDetails;

		const sum = calculateSumOfChildTaskTimeLogs(
			childrenIds,
			projectDetails.tasks.items,
		);

		moduleTotalTimeLog = {
			moduleId: parentModuleDetails.id,
			totalTimeLog: sum,
		};
	}

	if (parentPhaseDetails) {
		const {childrenIds} = parentPhaseDetails;

		const sum = calculateSumOfChildTaskTimeLogs(
			childrenIds,
			projectDetails.modules.items,
		);

		phaseTotalTimeLog = {
			phaseId: parentPhaseDetails.id,
			totalTimeLog: sum,
		};
	}

	return {
		moduleTotalTimeLog,
		phaseTotalTimeLog,
	};
}

/**
 * Reorders the time log data to show the logged-in user's entry at the top, if they are assigned to the task.
 * The other entries are sorted alphabetically by the employee name.
 *
 * @param {iProjectTaskTimelogTableRowData[]} data - The array of time log entries to be reordered.
 * @param {string} loggedInUserId - The ID of the logged-in user.
 * @returns {iProjectTaskTimelogTableRowData[]} - The reordered array with the logged-in user's entry at the top, if assigned,
 * followed by alphabetically sorted other entries.
 */
function reorderLoggedInUser(
	data: iProjectTaskTimelogTableRowData[],
	loggedInUserId: string,
): iProjectTaskTimelogTableRowData[] {
	if (!data || !loggedInUserId) {
		return data || []; // Return empty array if no data
	}

	// Find the logged-in user's entry
	const loggedInUserEntry = data.find((row) => {
		return row.allocationId === loggedInUserId;
	});

	// Filter out the logged-in user's entry and sort the remaining entries alphabetically by employeeName
	const otherEntries = data
		.filter((row) => {
			return row.allocationId !== loggedInUserId;
		})
		.sort((a, b) => {
			return (a.employeeName || "").localeCompare(b.employeeName || "");
		});

	// If the logged-in user is assigned, move them to the top
	return loggedInUserEntry
		? [loggedInUserEntry, ...otherEntries]
		: otherEntries;
}

const TimelogUtil = {
	getLastUpdatedOnAndBy,
	generateTimelogReportsDurationTitle,
	numericDateToTextDate,
	calculateTotalPlannedHours,
	calculateSumOfChildTaskTimeLogs,
	calculateParentTotalTimeLog,
	reorderLoggedInUser,
	DEFAULT_TIMELOG_REPORT_TABLE_PAGE_SIZE,
	DEFAULT_TIMELOG_REPORT_TABLE_PAGE_NUMBER,
};

export default TimelogUtil;
