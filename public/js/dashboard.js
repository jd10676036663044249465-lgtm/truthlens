const statsGrid = document.getElementById('statsGrid');
const classificationChart = document.getElementById('classificationChart');
const variablesChart = document.getElementById('variablesChart');
const latestList = document.getElementById('latestList');
const dashboardMessage = document.getElementById('dashboardMessage');

document.addEventListener('DOMContentLoaded', loadDashboard);

async function loadDashboard() {
  dashboardMessage.textContent = 'Cargando dashboard...';
  dashboardMessage.classList.remove('error');

  try {
    const stats = await TruthLensAPI.getDashboardStats();
    renderStats(stats);
    renderClassificationChart(stats.byClassification, stats.total);
    renderVariablesChart(stats.variables, stats.total);
    renderLatest(stats.latest);
    dashboardMessage.textContent = 'Dashboard actualizado.';
  } catch (error) {
    dashboardMessage.textContent = error.message;
    dashboardMessage.classList.add('error');
  }
}

function renderStats(stats) {
  const average = Math.round(stats.variables.averageScore || 0);
  const suspicious = findClassification(stats.byClassification, 'Posible Fake News');
  const doubtful = findClassification(stats.byClassification, 'Informacion dudosa');

  statsGrid.innerHTML = `
    <article class="stat-card">
      <span>Total de analisis</span>
      <strong>${stats.total}</strong>
    </article>
    <article class="stat-card">
      <span>Promedio de confianza</span>
      <strong>${average}%</strong>
    </article>
    <article class="stat-card">
      <span>Posibles Fake News</span>
      <strong>${suspicious}</strong>
    </article>
    <article class="stat-card">
      <span>Informacion dudosa</span>
      <strong>${doubtful}</strong>
    </article>
  `;
}

function renderClassificationChart(items, total) {
  if (!items.length) {
    classificationChart.innerHTML = '<p class="message">Sin datos suficientes.</p>';
    return;
  }

  classificationChart.innerHTML = items.map((item) => {
    const percent = total ? Math.round((item.count / total) * 100) : 0;
    return renderBar(item._id, item.count, percent);
  }).join('');
}

function renderVariablesChart(variables, total) {
  const rows = [
    ['A Fuente confiable', variables.reliableSource],
    ['B Verificacion externa', variables.externalVerification],
    ['C Autor identificado', variables.identifiedAuthor],
    ['D Lenguaje alarmista', variables.alarmistLanguage],
    ['E Senales sospechosas', variables.suspiciousSignals]
  ];

  variablesChart.innerHTML = rows.map(([label, count]) => {
    const percent = total ? Math.round((count / total) * 100) : 0;
    return renderBar(label, count, percent);
  }).join('');
}

function renderBar(label, count, percent) {
  return `
    <div class="bar-row">
      <div class="bar-label">
        <span>${label}</span>
        <span>${count} (${percent}%)</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${percent}%"></div>
      </div>
    </div>
  `;
}

function renderLatest(analyses) {
  if (!analyses.length) {
    latestList.innerHTML = '<p class="message">Todavia no hay analisis guardados.</p>';
    return;
  }

  latestList.innerHTML = analyses.map((analysis) => `
    <article class="history-card">
      <div>
        <h3>${getTitle(analysis)}</h3>
        <div class="history-meta">
          <span>${formatDate(analysis.createdAt)}</span>
          <span>${analysis.score}%</span>
          <span class="badge ${getBadgeClass(analysis.classification)}">${analysis.classification}</span>
        </div>
      </div>
    </article>
  `).join('');
}

function findClassification(items, name) {
  const item = items.find((entry) => entry._id === name);
  return item ? item.count : 0;
}

function getTitle(analysis) {
  if (analysis.url) return analysis.url;
  if (analysis.text) return `${analysis.text.slice(0, 90)}${analysis.text.length > 90 ? '...' : ''}`;
  if (analysis.image && analysis.image.originalName) return analysis.image.originalName;
  return 'Analisis sin titulo';
}

function getBadgeClass(classification) {
  if (classification === 'Alta confiabilidad') return 'high';
  if (classification === 'Informacion dudosa') return 'medium';
  return 'low';
}

function formatDate(value) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}
