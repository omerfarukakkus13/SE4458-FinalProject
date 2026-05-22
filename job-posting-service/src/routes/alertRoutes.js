const express = require('express');
const router = express.Router();
const alertCtrl = require('../controllers/alertController');

router.post('/', alertCtrl.createAlert);
router.get('/', alertCtrl.getUserAlerts);
router.delete('/:id', alertCtrl.deleteAlert);

module.exports = router;
