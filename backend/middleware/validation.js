const { body, validationResult } = require('express-validator');

const validateConnection = [
  body('sheetId').notEmpty().withMessage('Sheet ID is required'),
  body('slideId').notEmpty().withMessage('Slide ID is required'),
  body('sheetRange').notEmpty().withMessage('Sheet range is required'),
  body('slidePageId').notEmpty().withMessage('Slide page ID is required'),
  body('x').isNumeric().withMessage('X coordinate must be a number'),
  body('y').isNumeric().withMessage('Y coordinate must be a number'),
  body('width').isNumeric().withMessage('Width must be a number'),
  body('height').isNumeric().withMessage('Height must be a number'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

module.exports = {
  validateConnection,
  validate,
};