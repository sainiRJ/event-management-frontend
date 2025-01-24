import moment from "moment-timezone";

import {iProjectTaskTimelogTableRowData} from "@/customTypes/appDataTypes/timeLogTypes";

const DEFAULT_DATE_FORMAT = "MM-DD-YYYY";
const DEFAULT_DATE_TIME_FORMAT = "MM-DD-YYYY HH:mm:ss";
const DATE_IN_TEXT_FORMAT = "ddd, MMM DD YYYY"; // "Mon, May 06 2024"

enum MomentDays {
	SUNDAY = 0,
	MONDAY = 1,
	TUESDAY = 2,
	WEDNESDAY = 3,
	THURSDAY = 4,
	FRIDAY = 5,
	SATURDAY = 6,
}

enum MomentISOWeekDays {
	MONDAY = 1,
	TUESDAY = 2,
	WEDNESDAY = 3,
	THURSDAY = 4,
	FRIDAY = 5,
	SATURDAY = 6,
	SUNDAY = 7,
}

/**
 * Format date time to a specific format based on the system time zone
 * @param dateTime - The date time to format
 * @param format - The format to use for the date time string (default: "MM-DD-YYYY")
 * @returns - The formatted date time string based on the system time zone and format provided (default: "MM-DD-YYYY")
 */
function formatDate(
	dateTime: string,
	format: string = DEFAULT_DATE_FORMAT,
): string {
	if (dateTime && dateTime !== "" && dateTime.length > 0) {
		const systemTimeZone = moment.tz.guess();

		const mDateTime = moment(dateTime);

		mDateTime.tz(systemTimeZone);

		const formattedDateTime = mDateTime.format(format);

		return formattedDateTime;
	} else {
		return "";
	}
}

/**
 * Convert a date time string to server date time moment object
 * @param dateTime - The date time string to convert
 * @returns - The converted date time string
 */
function toServerDateTime(
	dateTime: string,
	dateTimeFormat: string = DEFAULT_DATE_FORMAT,
): moment.Moment {
	const mDateTime = moment.utc(dateTime, dateTimeFormat);
	return mDateTime;
}

/**
 * Converts the task duration to moment days.
 * The task duration is the number of days the task will take to complete.
 *
 * For example, if the startDate is 10-01-2024 and the endDate is 10-05-2024,
 * the task duration is 5 days. However, the moment days is 4 days.
 * This is because the task duration is inclusive of the start date and end date.
 *
 * Similarly, if the startDate is 10-01-2024 and the endDate is 10-01-2024,
 * the task duration is 1 day. However, the moment days is 0 days.
 *
 * In BI Tool, very rarely we use the task duration as 0 instead of 1. This is when
 * a task has startDate and endDate on the same day and another task which is linked to
 * this task (the child task) is set to start on the same day as this task (the parent
 * task). In this case, the task duration is 0 and the child task's duration is normally
 * computed based on the startDate and endDate of the child task itself. That is why
 * we need to handle the task duration of 0 and 1 separately. Meaning, if the task duration
 * is 0 or 1, the moment days is always 0. And for any other task duration, the moment days
 * is the taskDuration minus 1.
 *
 * PS: Dates are in the format MM-DD-YYYY.
 *
 * @param taskDuration
 * @returns
 */
function taskDurationToMomentDays(taskDuration: number): number {
	if (taskDuration === 0 || taskDuration === 1) {
		return 0;
	}

	return taskDuration - 1;
}

/**
 * Converts the moment days to task duration.
 *
 * The task duration is the number of days the task will take to complete.
 *
 * For example, if the startDate is 10-01-2024 and the endDate is 10-05-2024,
 * the moment days is 4. However, the task duration is 5 days.
 * This is because the task duration is inclusive of the start date and end date.
 *
 * Similarly, if the startDate is 10-01-2024 and the endDate is 10-01-2024,
 * the moment days is 0 days. However, the task duration is 1 day by default.
 *
 * NOTE: In BI Tool, very rarely we use the task duration as 0 instead of 1. This is when
 * a task has startDate and endDate on the same day and another task which is linked to
 * this task (the child task) is set to start on the same day as this task (the parent
 * task). In this case, the task duration is 0 and the child task's duration is normally
 * computed based on the startDate and endDate of the child task itself. This can't be
 * handled by this function as it is not aware of the startDate and endDate of the child
 * task. So, it has to be handled outside of this function.
 *
 * PS: Dates are in the format MM-DD-YYYY.
 *
 * @param momentDays
 * @returns
 */
function momentDaysToTaskDuration(momentDays: number): number {
	return momentDays + 1;
}

/**
 * Checks if a given date is a working day, considering weekends,explicit holidays,
 *  and explicit working days.
 *
 * @param date - The date to check if it's a working day. Can be a moment object or a string.
 * @param explicitHolidayList - An array of dates that should be treated as holidays.
 * @param explicitWorkingDayList - An array of dates that should be considered as working days, even if they fall on weekends or holidays.
 * @returns - A boolean indicating if the given date is a working day.
 */
function isWorkingDay(
	date: moment.Moment | string,
	explicitHolidayList: string[] = [],
	explicitWorkingDayList: string[] = [],
): boolean {
	let mDate: moment.Moment;

	// Convert date to a moment object if it's a string
	if (typeof date === "string") {
		mDate = moment(date);
	} else {
		mDate = date.clone();
	}

	const formattedDate = mDate.format(DEFAULT_DATE_FORMAT);

	// Check if the day is an explicit working day
	if (explicitWorkingDayList.includes(formattedDate)) {
		return true;
	}

	const dayOfWeek = mDate.isoWeekday();

	// Check if the day is a weekend or an explicit holiday
	if (
		dayOfWeek === MomentISOWeekDays.SATURDAY ||
		dayOfWeek === MomentISOWeekDays.SUNDAY ||
		explicitHolidayList.includes(formattedDate)
	) {
		return false;
	}

	// It's a working day
	return true;
}

/**
 * Finds the next working day after a given date, considering weekends,
 * explicit holidays, and explicit working days.
 *
 * @param currentDate - The date from which to find the next working day. Can be a moment object or a string.
 * @param explicitHolidayList - An array of dates that should be treated as holidays.
 * @param explicitWorkingDayList - An array of dates that should be considered as working days, even if they fall on weekends or holidays.
 * @returns A moment object representing the next working day.
 */
function getTheNextWorkingDayAfter(
	currentDate: moment.Moment | string,
	explicitHolidayList: string[] = [],
	explicitWorkingDayList: string[] = [],
): moment.Moment {
	let nextWorkingDay: moment.Moment;

	// Convert currentDate to a moment object if it's a string
	if (typeof currentDate === "string") {
		nextWorkingDay = moment(currentDate);
	} else {
		nextWorkingDay = currentDate.clone();
	}

	// Start checking from the next day
	nextWorkingDay.add(1, "days");

	// Loop until we find the next working day
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const dayOfWeek = nextWorkingDay.isoWeekday();

		const formattedDate = nextWorkingDay.format(DEFAULT_DATE_FORMAT);

		// If the current day is an explicit working day, return it immediately
		if (explicitWorkingDayList.includes(formattedDate)) {
			return nextWorkingDay;
		}

		// Check if the day is a weekend or an explicit holiday
		if (
			dayOfWeek === MomentISOWeekDays.SATURDAY ||
			dayOfWeek === MomentISOWeekDays.SUNDAY ||
			explicitHolidayList.includes(formattedDate)
		) {
			// It's a weekend or a holiday, check the next day
			nextWorkingDay.add(1, "days");
		} else {
			// It's a working day, return it
			return nextWorkingDay;
		}
	}
}

/**
 * Finds the next working day after a given date, considering weekends,
 * explicit holidays, and explicit working days, with a minimum gap of a
 * specified number of days between the current date and the next working day.
 * The gap is inclusive of the holidays and weekends.
 *
 * For example, if the current date is a Friday and the next week days after
 * the weekend are working days, and the minimum gap is 2 days, the function
 * will return the next working day as the following Monday. If the following
 * Monday is a holiday, the function will return the next working day as the
 * following Tuesday.
 */
function getTheNextWorkingDayAfterWithAGap(
	currentDate: moment.Moment | string,
	minimumGap: number,
	explicitHolidayList: string[] = [],
	explicitWorkingDayList: string[] = [],
): moment.Moment {
	let nextWorkingDay: moment.Moment;

	// Convert currentDate to a moment object if it's a string
	if (typeof currentDate === "string") {
		nextWorkingDay = moment(currentDate);
	} else {
		nextWorkingDay = currentDate.clone();
	}

	// Start checking from the next day by maintaining the minimum gap
	nextWorkingDay.add(minimumGap, "days");

	// Loop until we find the next working day
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const dayOfWeek = nextWorkingDay.isoWeekday();

		const formattedDate = nextWorkingDay.format(DEFAULT_DATE_FORMAT);

		// If the current day is an explicit working day, return it immediately
		if (explicitWorkingDayList.includes(formattedDate)) {
			return nextWorkingDay;
		}

		// Check if the day is a weekend or an explicit holiday
		if (
			dayOfWeek === MomentISOWeekDays.SATURDAY ||
			dayOfWeek === MomentISOWeekDays.SUNDAY ||
			explicitHolidayList.includes(formattedDate)
		) {
			// It's a weekend or a holiday, check the next day
			nextWorkingDay.add(1, "days");
		} else {
			// It's a working day, return it
			return nextWorkingDay;
		}
	}
}

/**
 * Calculates the total number of working days between two dates, inclusive,
 * considering explicit holidays and working days.
 *
 * @param startDate - The start date of the range, included in the count.
 * @param endDate - The end date of the range, included in the count.
 * @param explicitHolidayList - An array of dates that are holidays.
 * @param explicitWorkingDayList - An array of dates that are working days, even if they fall on weekends or holidays.
 * @returns The total number of working days within the given date range.
 */
function calculateWorkingDays(
	startDate: moment.Moment | string,
	endDate: moment.Moment | string,
	explicitHolidayList: string[] = [],
	explicitWorkingDayList: string[] = [],
): number {
	let mCurrentDate: moment.Moment;

	// Convert startDate to moment objects if it is string
	if (typeof startDate === "string") {
		mCurrentDate = moment(startDate);
	} else {
		mCurrentDate = startDate.clone();
	}

	let mEndDate: moment.Moment;

	// Convert mEndDate to moment objects if it is string
	if (typeof endDate === "string") {
		mEndDate = moment(endDate);
	} else {
		mEndDate = endDate.clone();
	}

	let workingDaysCount = 0;

	// Iterate through each day in the range
	while (mCurrentDate.diff(mEndDate, "days") <= 0) {
		const dayOfWeek = mCurrentDate.isoWeekday();

		const formattedDate = mCurrentDate.format(DEFAULT_DATE_FORMAT);

		// Check if the day is an explicit working day or a normal working day (not a weekend and not a holiday)
		if (
			explicitWorkingDayList.includes(formattedDate) ||
			(!(
				dayOfWeek === MomentISOWeekDays.SATURDAY ||
				dayOfWeek === MomentISOWeekDays.SUNDAY
			) &&
				!explicitHolidayList.includes(formattedDate))
		) {
			workingDaysCount += 1;
		}

		// Move to the next day
		mCurrentDate.add(1, "days");
	}

	return workingDaysCount;
}

/**
 * Computes the updated end date of a task based on a new start date and the original task duration,
 * considering explicit holidays and working days.
 *
 * @param newStartDate - The updated start date of the task.
 * @param taskDuration - The duration of the task in working days, based on the old start and end dates.
 * @param explicitHolidayList - An array of dates that are holidays.
 * @param explicitWorkingDayList - An array of dates that are working days, even if they fall on weekends or holidays.
 * @returns The updated end date of the task.
 */
function computeUpdatedEndDate(
	newStartDate: moment.Moment | string,
	currentTaskDuration: number,
	explicitHolidayList: string[] = [],
	explicitWorkingDayList: string[] = [],
): moment.Moment {
	let currentDate: moment.Moment;

	// Convert newStartDate to a moment object if it's a string
	if (typeof newStartDate === "string") {
		currentDate = moment(newStartDate);
	} else {
		currentDate = newStartDate.clone();
	}

	let workingDaysCount = 0;

	/**
	 * Sometimes the task duration can be 0. This is when a task has startDate and endDate on the same day
	 * and another task which is linked to this task (the child task) is set to start on the same day as this
	 * task (the parent task). In this case, the task duration is 0 and the child task's duration is normally
	 * computed based on the startDate and endDate of the child task itself. That is why we need to handle the
	 * task duration of 0 separately. Meaning, if the task duration is 0, we still need to consider it as 1 day
	 * because the start date itself counts as the first working day.
	 */
	const taskDuration = currentTaskDuration > 0 ? currentTaskDuration : 1;

	// Start from the day before newStartDate because the start date itself counts as the first working day
	currentDate.subtract(1, "days");

	while (workingDaysCount < taskDuration) {
		currentDate.add(1, "days"); // Move to the next day

		const formattedDate = currentDate.format(DEFAULT_DATE_FORMAT);

		const dayOfWeek = currentDate.isoWeekday();

		// Check if it's an explicit working day or a regular working day (not a weekend and not a holiday)
		if (
			explicitWorkingDayList.includes(formattedDate) ||
			(!(
				dayOfWeek === MomentISOWeekDays.SATURDAY ||
				dayOfWeek === MomentISOWeekDays.SUNDAY
			) &&
				!explicitHolidayList.includes(formattedDate))
		) {
			workingDaysCount++;
		}
	}

	// currentDate now represents the updated end date of the task
	return currentDate;
}

/**
 * Formats a raw time input string into a standardized "XXh XXm" format.
 * This function handles various input formats:
 * - Explicit hour and minute markers ("6h 30m", "6h30m").
 * - Decimal hours ("6.5").
 * - Colon-separated hours and minutes ("6:30").
 * - Plain numerical input assumed to be hours ("6").
 *
 * The function first normalizes the input by removing spaces and converting to lowercase.
 * It then checks for the presence of 'h' or 'm' to identify hours and minutes.
 * Decimal and colon-separated values are processed if 'h' and 'm' are not found.
 * Any minutes exceeding 60 are converted into additional hours.
 *
 * @param {string} multiFormattedTimeInput - The time input string from the user.
 * @returns {string} The time formatted as "XXh XXm".
 */
function formatTimeToHoursAndMinutes(multiFormattedTimeInput: string): string {
	let hours = 0;
	let minutes = 0;

	let multiFormattedTimeInputToProcess = multiFormattedTimeInput;

	// Normalize spaces and remove unnecessary characters
	multiFormattedTimeInputToProcess = multiFormattedTimeInputToProcess
		.replace(/\s+/g, "")
		.toLowerCase();

	// Check for 'h' and 'm' patterns
	if (
		multiFormattedTimeInputToProcess.includes("h") ||
		multiFormattedTimeInputToProcess.includes("m")
	) {
		const hIndex = multiFormattedTimeInputToProcess.indexOf("h");

		if (hIndex !== -1) {
			hours = parseInt(
				multiFormattedTimeInputToProcess.substring(0, hIndex),
				10,
			);
			multiFormattedTimeInputToProcess =
				multiFormattedTimeInputToProcess.substring(hIndex + 1); // remaining part after 'h'
		}

		const mIndex = multiFormattedTimeInputToProcess.indexOf("m");

		if (mIndex !== -1) {
			minutes = parseInt(
				multiFormattedTimeInputToProcess.substring(0, mIndex),
				10,
			);
		}
	}
	// Handle decimal numbers (assuming no 'h' or 'm')
	else if (multiFormattedTimeInputToProcess.includes(".")) {
		const decimalHours = parseFloat(multiFormattedTimeInputToProcess);

		hours = Math.floor(decimalHours);
		minutes = Math.round((decimalHours - hours) * 60);
	}
	// Handle colon-separated values
	else if (multiFormattedTimeInputToProcess.includes(":")) {
		const parts = multiFormattedTimeInputToProcess.split(":");
		hours = parseInt(parts[0], 10);
		minutes = parseInt(parts[1], 10);
	}

	// Handle numeric input assuming it's just hours
	else {
		hours = parseInt(multiFormattedTimeInputToProcess, 10);
	}

	// Normalize minutes to proper format
	if (minutes >= 60) {
		hours += Math.floor(minutes / 60);
		minutes %= 60;
	}

	return `${hours}h ${minutes}m`;
}

/**
 * Converts a time formatted as "XXh XXm" into a decimal format.
 * This function converts a time input string into a decimal format.
 * It checks for the presence of 'h' and 'm' to identify hours and minutes.
 * The function calculates the total time in hours, including any additional minutes.
 *
 * @param {string} timeString - The time input string in the format "XXh XXm".
 * @returns {string} The time in decimal format.
 */
function convertTimeToDecimal(timeString: string): string {
	let totalHours = 0;
	let totalMinutes = 0;

	// Normalize the input string
	const normalizedTimeString = timeString.toLowerCase().replace(/\s/g, "");

	// Check for the presence of 'h' and 'm' to identify hours and minutes
	const hourIndex = normalizedTimeString.indexOf("h");
	const minuteIndex = normalizedTimeString.indexOf("m");

	if (hourIndex !== -1) {
		// Extract hours from the string
		const hoursString = normalizedTimeString.substring(0, hourIndex);
		totalHours += parseFloat(hoursString);
	}

	if (minuteIndex !== -1) {
		// Extract minutes from the string
		const minutesString = normalizedTimeString.substring(
			hourIndex !== -1 ? hourIndex + 1 : 0,
			minuteIndex,
		);
		totalMinutes += parseFloat(minutesString);
	}

	// Calculate the total time in decimal format
	const decimalTime = totalHours + totalMinutes / 60;

	return decimalTime.toString();
}

/**
 * Convert a time string in the format "Xh Xm" to minutes.
 * For example, "1h 30m" will be converted to 90 minutes.
 * @param {string} timeString The time string to convert.
 * @returns {number} The total number of minutes.
 */
function convertHoursToMinutes(timeString: string): number {
	const [hoursStr, minutesStr] = timeString.split("h ");
	const hours = parseInt(hoursStr);
	const minutes = minutesStr ? parseInt(minutesStr.replace("m", "")) : 0;
	return hours * 60 + minutes;
}

/**
 * This function iterates over the array of time log entries, extracts the logged hours
 * for the specified date, converts those hours to minutes, and then calculates the
 * total hours and minutes. The final result is a string representation of the total time in "XXh XXm" format.
 *
 * @param {iProjectTaskTimelogTableRowData[]} data - Array of time log entry data.
 * @param {string} formattedDateString - The date string in "MM-DD-YYYY" format.
 * @returns {string} - The formatted total hours and minutes string in "XXh XXm" for the specified date string.
 */
function totalHoursAndMinutesForDate(
	data: iProjectTaskTimelogTableRowData[],
	formattedDateString: string,
): string {
	const totalMinutes = data.reduce((total, entry) => {
		// Retrieve the logged hours for the specific date or default to "0h 0m" if not found
		const hoursForDate =
			entry.timelogEntriesByDate[formattedDateString]?.loggedHours || "0h 0m";

		// Convert the logged hours to minutes and accumulate the total
		return total + convertHoursToMinutes(hoursForDate);
	}, 0);

	// calculates the total hours by dividing totalMinutes by 60
	const hours = Math.floor(totalMinutes / 60);

	// calculates the remaining minutes by taking the remainder
	const minutes = totalMinutes % 60;

	return `${hours}h ${minutes}m`;
}

function parseTime(timeString: string): {
	totalHours: number;
	totalMinutes: number;
} {
	let totalMinutes = 0;

	// Normalize the input string
	const normalizedTimeString = timeString.toLowerCase().replace(/\s+/g, "");

	// Check for the presence of 'h' and 'm' to identify hours and minutes
	const hourIndex = normalizedTimeString.indexOf("h");
	const minuteIndex = normalizedTimeString.indexOf("m");

	if (hourIndex !== -1) {
		// Extract hours from the string
		const hoursString = normalizedTimeString.substring(0, hourIndex);
		const hours = parseInt(hoursString, 10);
		totalMinutes += hours * 60;
	}

	if (minuteIndex !== -1) {
		// Extract minutes from the string
		const minutesString = normalizedTimeString.substring(
			hourIndex !== -1 ? hourIndex + 1 : 0,
			minuteIndex,
		);
		const minutes = parseInt(minutesString, 10);
		totalMinutes += minutes;
	}

	// Handle decimal numbers (assuming no 'h' or 'm')
	else if (normalizedTimeString.includes(".")) {
		const decimalHours = parseFloat(normalizedTimeString);
		totalMinutes = Math.round(decimalHours * 60);
	}

	// Handle colon-separated values
	else if (normalizedTimeString.includes(":")) {
		const parts = normalizedTimeString.split(":");
		const hours = parseInt(parts[0], 10);
		const minutes = parseInt(parts[1], 10);
		totalMinutes = hours * 60 + minutes;
	}

	// Handle numeric input assuming it's just hours
	else {
		const hours = parseInt(normalizedTimeString, 10);
		totalMinutes = hours * 60;
	}

	const totalHours = totalMinutes / 60;

	return {totalHours, totalMinutes};
}

const DateTimeUtil = {
	DEFAULT_DATE_FORMAT,
	DEFAULT_DATE_TIME_FORMAT,
	DATE_IN_TEXT_FORMAT,
	MomentDays,
	MomentISOWeekDays,
	formatDate,
	toServerDateTime,
	taskDurationToMomentDays,
	momentDaysToTaskDuration,
	isWorkingDay,
	getTheNextWorkingDayAfter,
	getTheNextWorkingDayAfterWithAGap,
	calculateWorkingDays,
	computeUpdatedEndDate,
	formatTimeToHoursAndMinutes,
	convertTimeToDecimal,
	convertHoursToMinutes,
	totalHoursAndMinutesForDate,
	parseTime,
};

export default DateTimeUtil;

export {
	DEFAULT_DATE_FORMAT,
	DEFAULT_DATE_TIME_FORMAT,
	DATE_IN_TEXT_FORMAT,
	MomentDays,
	MomentISOWeekDays,
};
