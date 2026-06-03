const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    inputType: {
      type: String,
      enum: ['text', 'url', 'image', 'mixed'],
      required: true
    },
    text: {
      type: String,
      trim: true,
      default: ''
    },
    url: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      originalName: { type: String, default: '' },
      storedName: { type: String, default: '' },
      mimeType: { type: String, default: '' },
      size: { type: Number, default: 0 },
      path: { type: String, default: '' }
    },
    variables: {
      A: { type: Boolean, required: true },
      B: { type: Boolean, required: true },
      C: { type: Boolean, required: true },
      D: { type: Boolean, required: true },
      E: { type: Boolean, required: true }
    },
    variableLabels: {
      A: { type: String, default: 'Tiene fuente confiable' },
      B: { type: String, default: 'Esta verificada por otros medios' },
      C: { type: String, default: 'Tiene autor identificado' },
      D: { type: String, default: 'Utiliza lenguaje alarmista' },
      E: { type: String, default: 'Presenta senales sospechosas' }
    },
    logicExpression: {
      type: String,
      default: '(A AND B AND C) AND NOT(D OR E)'
    },
    logicResult: {
      type: Boolean,
      required: true
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    classification: {
      type: String,
      enum: ['Alta confiabilidad', 'Informacion dudosa', 'Posible Fake News'],
      required: true
    },
    reasons: {
      type: [String],
      default: []
    },
    signals: {
      positive: { type: [String], default: [] },
      negative: { type: [String], default: [] }
    },
    truthTable: {
      type: [
        {
          A: Boolean,
          B: Boolean,
          C: Boolean,
          D: Boolean,
          E: Boolean,
          result: Boolean,
          selected: Boolean
        }
      ],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Analysis', analysisSchema);
