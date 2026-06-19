const express = require('express');

const systemController = require('../../controllers/user/systemController');

const router = express.Router();

router.get('/status', systemController.getStatus);

module.exports = router;
