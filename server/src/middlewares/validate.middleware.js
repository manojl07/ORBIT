const ApiError = require("../utils/ApiError");

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const issues = result.error?.issues ?? result.error?.errors ?? [];

      const message = issues.length > 0 ? issues.map((issue) => issue.message).join(", ") : "Validation failed";

      return next(new ApiError(400, message));
    }

    req.body = result.data;

    next();
  };
};

module.exports = validate;