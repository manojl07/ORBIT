const ApiError = require('../utils/ApiError')

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if(!result.success){
      return next(new ApiError(400, result.error.errors.map(e => e.message).join(', ')))
    }

    req.body = result.data;

    next();
  }
}

module.exports = validate;