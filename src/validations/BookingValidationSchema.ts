import Joi from "joi";

export const bookingValidationSchema = Joi.object({
	id: Joi.string().allow(""),
	customerName: Joi.string().required().min(2).messages({
		"string.empty": "Customer name is required",
		"string.min": "Customer name must be at least 2 characters",
	}),
	phoneNumber: Joi.string()
		.pattern(/^[0-9]{10}$/)
		.required()
		.messages({
			"string.empty": "Phone number is required",
			"string.pattern.base": "Phone number must be 10 digits",
		}),
	eventDate: Joi.string().required().messages({
		"string.empty": "Event date is required",
	}),
	eventName: Joi.string().required().min(2).messages({
		"string.empty": "Event name is required",
		"string.min": "Event name must be at least 2 characters",
	}),
	venueAddress: Joi.string().required().min(5).messages({
		"string.empty": "Venue address is required",
		"string.min": "Venue address must be at least 5 characters",
	}),
	budget: Joi.string().required().messages({
		"string.empty": "Budget is required",
	}),
	advancePayment: Joi.string().required().messages({
		"string.empty": "Advance payment is required",
	}),
	notes: Joi.string().max(500).allow("").messages({
		"string.max": "Notes cannot exceed 500 characters",
	}),
	serviceId: Joi.string().required().messages({
		"string.empty": "Service is required",
	}),
	bookingStatusId: Joi.string().required().messages({
		"string.empty": "Booking status is required",
	}),
	paymentStatusId: Joi.string().allow(""),
	bookedAt: Joi.string().allow(""),
	serviceName: Joi.string().allow(""),
	paymentStatus: Joi.string().allow(""),
	bookingStatus: Joi.string().allow(""),
	assignedEmployeeIds: Joi.array()
		.items(Joi.string().required())
		.unique()
		.optional()
		.allow(null, "")
		.messages({
			"array.sparse": "Assigned employees array cannot contain empty values",
			"array.unique": "Duplicate employees are not allowed",
		}),
});
