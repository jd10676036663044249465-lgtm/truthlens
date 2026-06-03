const Analysis = require('../models/Analysis');

async function getDashboardStats(req, res, next) {
  try {
    const total = await Analysis.countDocuments();
    const latest = await Analysis.find().sort({ createdAt: -1 }).limit(8);

    const byClassification = await Analysis.aggregate([
      {
        $group: {
          _id: '$classification',
          count: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const byInputType = await Analysis.aggregate([
      {
        $group: {
          _id: '$inputType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const variableCounters = await Analysis.aggregate([
      {
        $group: {
          _id: null,
          reliableSource: { $sum: { $cond: ['$variables.A', 1, 0] } },
          externalVerification: { $sum: { $cond: ['$variables.B', 1, 0] } },
          identifiedAuthor: { $sum: { $cond: ['$variables.C', 1, 0] } },
          alarmistLanguage: { $sum: { $cond: ['$variables.D', 1, 0] } },
          suspiciousSignals: { $sum: { $cond: ['$variables.E', 1, 0] } },
          averageScore: { $avg: '$score' }
        }
      }
    ]);

    res.status(200).json({
      total,
      byClassification,
      byInputType,
      variables: variableCounters[0] || {
        reliableSource: 0,
        externalVerification: 0,
        identifiedAuthor: 0,
        alarmistLanguage: 0,
        suspiciousSignals: 0,
        averageScore: 0
      },
      latest
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats
};
