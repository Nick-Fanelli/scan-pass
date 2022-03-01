const router = require('express').Router();
const Pass = require('../models/Pass.Model');
const { AuthLevel, authorize } = require('../middleware/AuthorizationMiddleware');



module.exports = router;