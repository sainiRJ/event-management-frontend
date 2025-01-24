import React from "react";

// Enum for navigation key strokes
export enum NavigationKeyStrokes {
	Enter = "Enter",
	Tab = "Tab",
	ArrowLeft = "ArrowLeft",
	ArrowRight = "ArrowRight",
	ArrowUp = "ArrowUp",
	ArrowDown = "ArrowDown",
}

/**
 * Interface for the parameters required by the `calculateTargetPosition` function.
 */
interface iCalculateTargetPositionParams {
	direction: NavigationKeyStrokes;
	currentIndex: number;
	rowCount: number;
	columnCount: number;
}

/**
 * Interface for parameters required by `navigateToTargetCell`.
 */
interface iNavigateToTargetCellParams {
	cellRefs: Array<Array<React.RefObject<{enterEditMode: () => void}>>>;
	targetRow: number;
	targetColumn: number;
}

/**
 * Interface for parameters required by `handleKeyDown`.
 */
interface iHandleKeyDownParams {
	event: React.KeyboardEvent;
	currentIndex: number;
	columnCount: number;
	rowCount: number;
	cellRefs: Array<Array<React.RefObject<{enterEditMode: () => void}>>>;
}

/**
 * Calculates the target cell position in the grid based on the current cell index
 * and the desired navigation direction. This function ensures that the new position
 * wraps around to the next row or column when the boundary is reached.
 *
 * @param {NavigationKeyStrokes} params.direction - Specifies the navigation key direction, such as ArrowUp or ArrowDown.
 * @param {number} params.currentIndex - The current cell index in the grid.
 * @param {number} params.rowCount - Total number of rows in the grid.
 * @param {number} params.columnCount - Total number of columns in the grid.
 * @returns {Object} Object containing `row` and `column` properties of the calculated target cell.
 */
function calculateTargetPosition({
	direction,
	currentIndex,
	rowCount,
	columnCount,
}: iCalculateTargetPositionParams): {row: number; column: number} {
	const currentRow = Math.floor(currentIndex / columnCount); // Determines current row
	const currentColumn = currentIndex % columnCount; // Determines current column
	let targetRow = currentRow;
	let targetColumn = currentColumn;

	// Adjust targetRow and targetColumn based on direction
	switch (direction) {
		case NavigationKeyStrokes.ArrowLeft:
			if (currentColumn > 0) targetColumn -= 1;
			else if (currentRow > 0) {
				targetRow -= 1;
				targetColumn = columnCount - 1; // Wrap to previous row's end
			}
			break;
		case NavigationKeyStrokes.ArrowRight:
			if (currentColumn < columnCount - 1) targetColumn += 1;
			else if (currentRow < rowCount - 1) {
				targetRow += 1;
				targetColumn = 0; // Wrap to next row's start
			}
			break;
		case NavigationKeyStrokes.ArrowUp:
			if (currentRow > 0) targetRow -= 1;
			break;
		case NavigationKeyStrokes.ArrowDown:
			if (currentRow < rowCount - 1) targetRow += 1;
			break;
		default:
			return {row: currentRow, column: currentColumn}; // No movement for unsupported directions
	}

	return {row: targetRow, column: targetColumn};
}

/**
 * Focuses on the target cell in the table by invoking `enterEditMode` on the cell's ref.
 * This allows for keyboard-driven navigation within a grid of editable cells.
 *
 * @param {iNavigateToTargetCellParams} params - Parameters for navigating to the target cell.
 * @param {Array<Array<React.RefObject<{enterEditMode: () => void}>>>} params.cellRefs - 2D array of cell references.
 * @param {number} params.targetRow - Row index of the target cell.
 * @param {number} params.targetColumn - Column index of the target cell.
 */
function navigateToTargetCell({
	cellRefs,
	targetRow,
	targetColumn,
}: iNavigateToTargetCellParams): void {
	const targetCell = cellRefs?.[targetRow]?.[targetColumn]?.current; // Retrieve the target cell ref
	if (targetCell) {
		// Focus the cell and trigger edit mode
		targetCell.enterEditMode();
	}
}

/**
 * Handles keyboard navigation within a table or grid of RSuite cells.
 * Supports Arrow keys, Enter, and Tab (including Shift+Tab for reverse navigation).
 *
 * @param {iHandleKeyDownParams} params - Parameters for handling keydown events.
 * @param {React.KeyboardEvent} params.event - The keyboard event triggered by the user's action.
 * @param {number} params.currentIndex - Current index of the cell in the grid.
 * @param {number} params.columnCount - Number of columns in the grid.
 * @param {number} params.rowCount - Number of rows in the grid.
 * @param {Array<Array<React.RefObject<{enterEditMode: () => void}>>>} params.cellRefs - 2D array of cell references for navigation.
 */
function handleKeyDown({
	event,
	currentIndex,
	columnCount,
	rowCount,
	cellRefs,
}: iHandleKeyDownParams): void {
	// Check if the key is Enter or Tab, with support for Shift+Tab
	if (
		[NavigationKeyStrokes.Enter, NavigationKeyStrokes.Tab].includes(
			event.key as NavigationKeyStrokes,
		)
	) {
		// Determine direction based on Shift key for Tab navigation
		const direction =
			event.shiftKey && event.key === NavigationKeyStrokes.Tab
				? NavigationKeyStrokes.ArrowLeft
				: NavigationKeyStrokes.ArrowRight;
		const {row, column} = calculateTargetPosition({
			direction,
			currentIndex,
			rowCount,
			columnCount,
		});
		navigateToTargetCell({cellRefs, targetRow: row, targetColumn: column});
		event.preventDefault();
	} else if (
		[
			NavigationKeyStrokes.ArrowUp,
			NavigationKeyStrokes.ArrowDown,
			NavigationKeyStrokes.ArrowLeft,
			NavigationKeyStrokes.ArrowRight,
		].includes(event.key as NavigationKeyStrokes)
	) {
		// Calculate target position for arrow keys
		const {row, column} = calculateTargetPosition({
			direction: event.key as NavigationKeyStrokes,
			currentIndex,
			rowCount,
			columnCount,
		});
		navigateToTargetCell({cellRefs, targetRow: row, targetColumn: column});
		event.preventDefault();
	}
}

// Exporting the utility with navigation functions for easier access in other files
const NavigationUtil = {
	calculateTargetPosition,
	navigateToTargetCell,
	handleKeyDown,
};

export default NavigationUtil;
