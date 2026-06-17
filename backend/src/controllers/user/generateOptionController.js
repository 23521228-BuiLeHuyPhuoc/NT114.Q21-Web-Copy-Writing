const generateOptionService = require('../../services/generateOptionService');
const asyncHandler = require('../../utils/asyncHandler');

const listGenerateOptions = asyncHandler(async (req, res) => {
  const options = await generateOptionService.listAllActiveOptions();

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: options,
  });
});

module.exports = {
  listGenerateOptions,
};
