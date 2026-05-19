const createError = require('../utils/createError');

function normalizeSchemas(schema, property) {
  if (schema && (schema.body || schema.query || schema.params)) {
    return schema;
  }

  return { [property]: schema };
}

function validate(schema, property = 'body') {
  const schemas = normalizeSchemas(schema, property);

  return (req, res, next) => {
    const errors = [];

    Object.entries(schemas).forEach(([key, joiSchema]) => {
      if (!joiSchema) return;

      const result = joiSchema.validate(req[key], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (result.error) {
        errors.push(...result.error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })));
        return;
      }

      req[key] = result.value;
    });

    if (errors.length > 0) {
      return next(createError(400, 'Validation error', errors));
    }

    return next();
  };
}

module.exports = validate;
