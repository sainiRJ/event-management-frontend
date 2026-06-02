import Joi from "joi";

export const serviceValidationSchema = Joi.object({
	serviceName: Joi.string().required().min(3).messages({
		"string.empty": "Service name is required",
		"string.min": "Service name must be at least 3 characters",
	}),
	description: Joi.string().allow("", null).optional(),
	price: Joi.string().required().messages({
		"string.empty": "Price is required",
	}),
	available: Joi.boolean().required(),
});
