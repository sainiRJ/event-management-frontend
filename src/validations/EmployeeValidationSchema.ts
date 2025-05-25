import Joi from "joi";

export const employeeValidationSchema = Joi.object({
	name: Joi.string().required().min(2).messages({
		"string.empty": "Name is required",
		"string.min": "Name must be at least 2 characters",
	}),
	email: Joi.string()
		.email({tlds: {allow: false}})
		.required()
		.messages({
			"string.empty": "Email is required",
			"string.email": "Please enter a valid email",
		}),
	phoneNumber: Joi.string()
		.pattern(/^\d{10}$/)
		.required()
		.messages({
			"string.empty": "Phone number is required",
			"string.pattern.base": "Please enter a valid 10-digit phone number",
		}),
	designation: Joi.string().required().min(2).messages({
		"string.empty": "Designation is required",
		"string.min": "Designation must be at least 2 characters",
	}),
	statusId: Joi.string().required().messages({
		"string.empty": "Status is required",
	}),
	joinedDate: Joi.date().required().messages({
		"date.base": "Invalid date format",
		"any.required": "Joined date is required",
	}),
});
