const express = require('express');

const publicSiteController = require('../../controllers/admin/publicSiteController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const {
  pageKeyParam,
  updatePublicPageSchema,
} = require('../../validations/publicSiteValidation');

const router = express.Router();

router.use(protect('admin'));

router.get('/', publicSiteController.listPages);
router.get('/:key', validate(pageKeyParam, 'params'), publicSiteController.getPage);
router.patch('/:key', validate({ params: pageKeyParam, body: updatePublicPageSchema }), publicSiteController.updatePage);

module.exports = router;
