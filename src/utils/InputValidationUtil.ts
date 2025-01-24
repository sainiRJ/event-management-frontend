const sanitizeBillValueInput = (input: string) => {
	// Remove characters that are not digits or dots
	let sanitizedInput = input.replace(/[^\d.]/g, "");

	// Handle cases where input is only zeros
	if (/^0+$/.test(sanitizedInput)) {
		return "0";
	}

	// Remove leading zeros if not part of a decimal number "0.x"
	sanitizedInput = sanitizedInput.replace(/^0+([1-9])/, "$1");

	// Disallow inputs that start with a dot or have multiple dots
	if (
		sanitizedInput.startsWith(".") ||
		(sanitizedInput.match(/\./g) || []).length > 1
	) {
		sanitizedInput = sanitizedInput.replace(/^\./, "").replace(/\./g, "");
	}

	// Handle edge case where sanitized input might become empty
	if (sanitizedInput === "") {
		return "0"; // Default to "0" if input is effectively empty or invalid
	}

	return sanitizedInput;
};

const InputValidationUtil = {
	sanitizeBillValueInput,
};

export default InputValidationUtil;
