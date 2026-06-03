const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

const connectDB = require('./src/config/database');
const analysisRoutes = require('./src/routes/analysisRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'TruthLens',
    database: 'MongoDB',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/analyses', analysisRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) return next();
  return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`TruthLens running at http://localhost:${PORT}`);
});
