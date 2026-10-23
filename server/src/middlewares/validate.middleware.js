const ApiError = require("../utils/ApiError");

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) return next(new ApiError(400,getValidationMessage(result)));
  
    req.body = result.data;
    next();
  };
};

const getValidationMessage = (result) => {
  const issues =result.error?.issues ??result.error?.errors ??[];

  if (!issues.length) {
    return "Validation failed";
  }

  return issues.map((issue) => issue.message).join(", ");
};


const validateQuery = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return next(new ApiError(400,getValidationMessage(result)));
    }

    req.validatedQuery = result.data;
    next();
  };
};

module.exports = validate;
module.exports.validateQuery = validateQuery;