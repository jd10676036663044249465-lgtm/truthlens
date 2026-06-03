const form = document.getElementById('analysisForm');
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
const resultPanel = document.getElementById('resultPanel');
const formMessage = document.getElementById('formMessage');
const imageInput = document.getElementById('image');
const fileName = document.getElementById('fileName');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    tabs.forEach((item) => item.classList.remove('active'));
    panels.forEach((panel) => panel.classList.remove('active'));

    tab.classList.add('active');
    document.querySelector(`[data-panel="${target}"]`).classList.add('active');
  });
});

imageInput.addEventListener('change', () => {
  fileName.textContent = imageInput.files[0] ? imageInput.files[0].name : '';
});

form.addEventListener('reset', () => {
  formMessage.textContent = '';
  formMessage.classList.remove('error');
  fileName.textContent = '';
  renderEmptyResult();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formMessage.textContent = 'Analizando contenido...';
  formMessage.classList.remove('error');

  try {
    const formData = new FormData(form);
    const result = await TruthLensAPI.createAnalysis(formData);
    renderResult(result);
    formMessage.textContent = 'Analisis guardado correctamente.';
  } catch (error) {
    formMessage.textContent = error.message;
    formMessage.classList.add('error');
  }
});

function renderEmptyResult() {
  resultPanel.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">?</div>
      <h2>Resultado pendiente</h2>
      <p>Cuando ejecutes un analisis, aqui apareceran el porcentaje, la clasificacion, las variables logicas y las razones.</p>
    </div>
  `;
}

function getBadgeClass(classification) {
  if (classification === 'Alta confiabilidad') return 'high';
  if (classification === 'Informacion dudosa') return 'medium';
  return 'low';
}

function getMeterColor(classification) {
  if (classification === 'Alta confiabilidad') return '#15803d';
  if (classification === 'Informacion dudosa') return '#ca8a04';
  return '#dc2626';
}

function renderResult(result) {
  const selectedRows = result.truthTable.filter((row) => row.selected);
  const supportRows = result.truthTable
    .filter((row) => row.result)
    .slice(0, 3)
    .concat(selectedRows)
    .filter((row, index, array) => array.findIndex((item) =>
      item.A === row.A && item.B === row.B && item.C === row.C && item.D === row.D && item.E === row.E
    ) === index);

  resultPanel.innerHTML = `
    <div class="score-card">
      <div class="meter" style="--score:${result.score}; --meter-color:${getMeterColor(result.classification)}">
        <strong>${result.score}%</strong>
      </div>
      <div>
        <span class="badge ${getBadgeClass(result.classification)}">${result.classification}</span>
        <h2>Evaluacion de confiabilidad</h2>
        <p>Expresion: <strong>${result.logicExpression}</strong></p>
        <p>Resultado logico: <strong>${result.logicResult ? 'Verdadero' : 'Falso'}</strong></p>
      </div>
    </div>

    <h3>Variables logicas</h3>
    <div class="logic-grid">
      ${renderVariable('A', 'Fuente confiable', result.variables.A)}
      ${renderVariable('B', 'Verificacion externa', result.variables.B)}
      ${renderVariable('C', 'Autor identificado', result.variables.C)}
      ${renderVariable('D', 'Lenguaje alarmista', result.variables.D)}
      ${renderVariable('E', 'Senales sospechosas', result.variables.E)}
    </div>

    <h3>Razones de la evaluacion</h3>
    <ul class="reasons">
      ${result.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join('')}
    </ul>

    <h3>Tabla de verdad resumida</h3>
    <table class="truth-table">
      <thead>
        <tr>
          <th>A</th>
          <th>B</th>
          <th>C</th>
          <th>D</th>
          <th>E</th>
          <th>Resultado</th>
        </tr>
      </thead>
      <tbody>
        ${supportRows.map(renderTruthRow).join('')}
      </tbody>
    </table>
  `;
}

function renderVariable(letter, label, value) {
  return `
    <div class="logic-item">
      <span>${letter} = ${label}</span>
      <strong>${value ? 'Verdadero' : 'Falso'}</strong>
    </div>
  `;
}

function renderTruthRow(row) {
  return `
    <tr class="${row.selected ? 'selected' : ''}">
      <td>${Number(row.A)}</td>
      <td>${Number(row.B)}</td>
      <td>${Number(row.C)}</td>
      <td>${Number(row.D)}</td>
      <td>${Number(row.E)}</td>
      <td>${row.result ? 'Verdadero' : 'Falso'}</td>
    </tr>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
