const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis
} = require('../controllers/analysisController');

const router = express.Router();

router.route('/')
  .get(getAnalyses)
  .post(upload.single('image'), createAnalysis);

router.route('/:id')
  .get(getAnalysisById)
  .delete(deleteAnalysis);

module.exports = router;
