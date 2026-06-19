const express = require('express');

const publicSiteController = require('../../controllers/user/publicSiteController');
const validate = require('../../middlewares/validation/validate');
const { pageKeyParam } = require('../../validations/publicSiteValidation');

const router = express.Router();

router.get('/blog', publicSiteController.getBlog);
router.get('/pages/:key', validate(pageKeyParam, 'params'), publicSiteController.getPage);

module.exports = router;
