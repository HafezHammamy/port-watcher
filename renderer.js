const $ = (sel) => document.querySelector(sel);
const rowsEl = $('#rows');
const searchEl = $('#search');
const countEl = $('#count');
const emptyEl = $('#empty');
const toastEl = $('#toast');

let allRows = [];
let sortKey = 'port';
let sortDir = 1; // 1 asc, -1 desc
let autoTimer = null;

function toast(msg, isErr = false) {
  toastEl.textContent = msg;
  toastEl.className = 'show' + (isErr ? ' err' : '');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (toastEl.className = ''), 2500);
}

function matches(row, q) {
  if (!q) return true;
  const hay = [row.proto, row.local, row.port, row.state, row.process, row.pid]
    .join(' ')
    .toLowerCase();
  return hay.includes(q);
}

function compare(a, b) {
  let av = a[sortKey];
  let bv = b[sortKey];
  if (sortKey === 'port' || sortKey === 'pid') {
    return (Number(av) - Number(bv)) * sortDir;
  }
  av = (av ?? '').toString().toLowerCase();
  bv = (bv ?? '').toString().toLowerCase();
  if (av < bv) return -1 * sortDir;
  if (av > bv) return 1 * sortDir;
  return 0;
}

function render() {
  const q = searchEl.value.trim().toLowerCase();
  const filtered = allRows.filter((r) => matches(r, q)).sort(compare);

  rowsEl.innerHTML = '';
  for (const r of filtered) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="proto">${r.proto}</td>
      <td class="mono">${escapeHtml(r.local)}</td>
      <td class="port">${r.port}</td>
      <td>${escapeHtml(r.state || '')}</td>
      <td>${escapeHtml(r.process || '—')}</td>
      <td class="pid">${r.pid}</td>
      <td><button class="kill" data-pid="${r.pid}" data-proc="${escapeAttr(r.process || '')}">Kill</button></td>
    `;
    rowsEl.appendChild(tr);
  }

  emptyEl.hidden = filtered.length > 0;
  countEl.textContent = `${filtered.length} / ${allRows.length} shown`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

async function refresh() {
  try {
    const data = await window.api.listPorts();
    allRows = data;
    render();
  } catch (e) {
    toast('Failed to list ports: ' + e.message, true);
  }
}

rowsEl.addEventListener('click', async (e) => {
  const btn = e.target.closest('button.kill');
  if (!btn) return;
  const pid = btn.dataset.pid;
  const proc = btn.dataset.proc || 'process';
  if (!confirm(`Kill ${proc} (PID ${pid})?`)) return;
  btn.disabled = true;
  btn.textContent = '…';
  try {
    await window.api.killPid(pid);
    toast(`Killed PID ${pid}`);
    await refresh();
  } catch (err) {
    toast('Kill failed: ' + err.message, true);
    btn.disabled = false;
    btn.textContent = 'Kill';
  }
});

searchEl.addEventListener('input', render);

$('#refresh').addEventListener('click', refresh);

$('#auto').addEventListener('change', (e) => {
  if (e.target.checked) {
    autoTimer = setInterval(refresh, 3000);
  } else {
    clearInterval(autoTimer);
    autoTimer = null;
  }
});

document.querySelectorAll('th[data-sort]').forEach((th) => {
  th.addEventListener('click', () => {
    const key = th.dataset.sort;
    if (sortKey === key) sortDir *= -1;
    else {
      sortKey = key;
      sortDir = 1;
    }
    render();
  });
});

refresh();
