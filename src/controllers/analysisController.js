const Analysis = require('../models/Analysis');
const { analyzeContent } = require('../services/logicService');

async function createAnalysis(req, res, next) {
  try {
    const text = req.body.text || '';
    const url = req.body.url || '';

    if (!text.trim() && !url.trim() && !req.file) {
      res.status(400);
      throw new Error('Debes ingresar una noticia, una URL o subir una imagen.');
    }

    const result = analyzeContent({ text, url, file: req.file });

    const analysis = await Analysis.create({
      inputType: result.inputType,
      text,
      url,
      image: result.image || undefined,
      variables: result.variables,
      logicResult: result.logicResult,
      score: result.score,
      classification: result.classification,
      reasons: result.reasons,
      signals: result.signals,
      truthTable: result.truthTable
    });

    res.status(201).json(analysis);
  } catch (error) {
    next(error);
  }
}

async function getAnalyses(req, res, next) {
  try {
    const analyses = await Analysis.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json(analyses);
  } catch (error) {
    next(error);
  }
}

async function getAnalysisById(req, res, next) {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      res.status(404);
      throw new Error('Analisis no encontrado.');
    }

    res.status(200).json(analysis);
  } catch (error) {
    next(error);
  }
}

async function deleteAnalysis(req, res, next) {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      res.status(404);
      throw new Error('Analisis no encontrado.');
    }

    await analysis.deleteOne();

    res.status(200).json({
      message: 'Analisis eliminado correctamente.',
      id: req.params.id
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis
};
