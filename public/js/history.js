const historyContainer = document.getElementById('historyContainer');
const historyMessage = document.getElementById('historyMessage');
const refreshButton = document.getElementById('refreshHistory');

refreshButton.addEventListener('click', loadHistory);
document.addEventListener('DOMContentLoaded', loadHistory);

async function loadHistory() {
  historyMessage.textContent = 'Cargando historial...';
  historyMessage.classList.remove('error');

  try {
    const analyses = await TruthLensAPI.getAnalyses();
    renderHistory(analyses);
    historyMessage.textContent = analyses.length ? `${analyses.length} analisis encontrados.` : 'No hay analisis guardados.';
  } catch (error) {
    historyMessage.textContent = error.message;
    historyMessage.classList.add('error');
  }
}

function renderHistory(analyses) {
  if (!analyses.length) {
    historyContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">0</div><h2>Sin registros</h2><p>Ejecuta un analisis para verlo aqui.</p></div>';
    return;
  }

  historyContainer.innerHTML = analyses.map((analysis) => `
    <article class="history-card">
      <div>
        <h3>${getTitle(analysis)}</h3>
        <div class="history-meta">
          <span>${formatDate(analysis.createdAt)}</span>
          <span>${analysis.inputType}</span>
          <span>${analysis.score}%</span>
          <span class="badge ${getBadgeClass(analysis.classification)}">${analysis.classification}</span>
        </div>
      </div>
      <button class="danger-btn" type="button" data-id="${analysis._id}">Eliminar</button>
    </article>
  `).join('');

  document.querySelectorAll('.danger-btn[data-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      await removeAnalysis(button.dataset.id);
    });
  });
}

async function removeAnalysis(id) {
  historyMessage.textContent = 'Eliminando analisis...';
  historyMessage.classList.remove('error');

  try {
    await TruthLensAPI.deleteAnalysis(id);
    await loadHistory();
  } catch (error) {
    historyMessage.textContent = error.message;
    historyMessage.classList.add('error');
  }
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
