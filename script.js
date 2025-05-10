/* ----------------- badge preview logic ---------------- */
const apiBase = 'https://issue-metrics-badge.vercel.app/api/issues-badge';
const repoInput = document.getElementById('repoInput');
const themeSelect = document.getElementById('themeSelect');
const labelsInput = document.getElementById('labelsInput');
const badgeImg = document.getElementById('badgeImg');
const mdOutput = document.getElementById('mdOutput');
const errMsg = document.getElementById('errMsg');

function buildURL() {
  const repo = repoInput.value.trim();
  if (!repo) return '';
  const p = new URLSearchParams({ repo, theme: themeSelect.value });
  const labels = labelsInput.value.trim();
  if (labels) p.append('label', labels);
  return `${apiBase}?${p}`;
}

function updatePreview() {
  const url = buildURL();
  if (!url) {
    badgeImg.classList.remove('show');
    mdOutput.value = '';
    return;
  }
  badgeImg.src = url;
  mdOutput.value = `![GitHub Issues](${url})`;
}

badgeImg.onerror = () => {
  badgeImg.classList.remove('show');
  errMsg.style.display = 'block';
};
badgeImg.onload = () => {
  badgeImg.classList.add('show');
  errMsg.style.display = 'none';
};
[repoInput, themeSelect, labelsInput].forEach(el =>
  el.addEventListener('input', updatePreview)
);
updatePreview();

document.getElementById('copyBtn').onclick = () =>
  navigator.clipboard.writeText(mdOutput.value || '');

/* ----------------- errors accordion ------------------ */
const ERRORS = [
  { t: 'Missing `repo` parameter', s: `${apiBase}`, h: 'Add <code>?repo=username/repo</code>.' },
  {
    t: 'Unknown theme',
    s: `${apiBase}?repo=vercel/next.js&theme=unknown`,
    h: 'Allowed values: <code>light</code>, <code>dark</code>, <code>terminal</code>.'
  },
  { t: 'Invalid repo format', s: `${apiBase}?repo=badformat`, h: 'Use <code>username/repo</code>.' },
  {
    t: 'Repository not found',
    s: `${apiBase}?repo=someuser/notexistingrepo`,
    h: 'Check spelling of owner and repository.'
  },
  { t: 'Internal Error', s: '', h: 'Server issue – retry later.' }
];

const errTable = document.getElementById('errTable');
ERRORS.forEach((e, i) => {
  const main = document.createElement('tr');
  main.className = 'main';
  main.innerHTML = `
    <td>${e.t}</td>
    <td>${e.s ? `<img class="badge" src="${e.s}" alt="${e.t}">` : '—'}</td>
    <td class="btncell"><button class="question" data-i="${i}">?</button></td>`;
  const det = document.createElement('tr');
  det.className = 'detail';
  det.innerHTML = `<td colspan="3"><div class="detail-inner">${e.h}</div></td>`;
  errTable.append(main, det);
});

/* accordion toggle */
errTable.addEventListener('click', ev => {
  const btn = ev.target.closest('button');
  if (!btn) return;
  const idx = btn.dataset.i;
  const mainRow = btn.closest('tr');
  const detailRow = mainRow.nextElementSibling;
  const inner = detailRow.querySelector('.detail-inner');
  const isOpen = detailRow.classList.contains('open');

  if (isOpen) {
    inner.style.maxHeight = inner.scrollHeight + 'px';
    requestAnimationFrame(() => (inner.style.maxHeight = '0'));
    detailRow.classList.remove('open');
    btn.textContent = '?';
    btn.className = 'question';
  } else {
    detailRow.classList.add('open');
    inner.style.maxHeight = '';
    const h = inner.scrollHeight;
    inner.style.maxHeight = '0';
    requestAnimationFrame(() => (inner.style.maxHeight = h + 'px'));
    btn.textContent = '↑';
    btn.className = 'arrow';
  }
});

/* show/hide entire error section */
const errorsWrap = document.getElementById('errorsWrap');
const toggleBtn = document.getElementById('toggleErrors');
toggleBtn.onclick = () => {
  const vis = errorsWrap.style.display !== 'none';
  errorsWrap.style.display = vis ? 'none' : 'block';
  toggleBtn.textContent = vis ? 'Possible errors »' : 'Hide errors «';
};
