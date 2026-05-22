const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/jobController');

// Versioned under /api/v1/jobs
router.get('/autocomplete', ctrl.autocomplete);
router.get('/my-applications', ctrl.getUserApplications);
router.get('/', ctrl.getAllJobs);
router.post('/', ctrl.createJob);
router.get('/:id/related', ctrl.getRelatedJobs);
router.get('/:id/applicants', ctrl.getJobApplicants);
router.get('/:id', ctrl.getJobById);
router.put('/:id', ctrl.updateJob);
router.post('/:id/apply', ctrl.applyJob);

module.exports = router;
