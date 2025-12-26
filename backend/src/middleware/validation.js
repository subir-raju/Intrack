const Joi = require("joi");
const logger = require("../utils/logger");

const schemas = {
  loginSchema: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),

  registerSchema: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("admin", "qcmanager").required(),
    productionLineId: Joi.number().integer().optional(),
  }),

  productionRecordSchema: Joi.object({
    productionLineId: Joi.number().integer().required(),
    type: Joi.string()
      .valid("firsttimethrough", "needimprovement", "modified", "rejected")
      .required(),
    timestamp: Joi.date().iso().required(),
    defects: Joi.array().items(Joi.string()).optional(),
    modifications: Joi.array().items(Joi.string()).optional(),
    rejectionReasons: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().optional(),
  }),
};

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: details,
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  schemas,
  validateRequest,
};
