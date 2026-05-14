import { TAG_COLORS } from '../data/lessons.js';

const $ = id => document.getElementById(id);

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderBadge(tag) {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const [bg, fg] = TAG_COLORS[tag]?.[dark ? 'dark' : 'light'] || ['', ''];
  const badge = $('rbadge');
  badge.style.display = 'inline-block';
  badge.style.background = bg;
  badge.style.color = fg;
  badge.textContent = tag;
}

function isAggregation(data) {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    '_id' in data[0] &&
    !data[0].glb_url
  );
}

export function renderCards(models, onClick) {
  const cardsEl = $('cards');
  cardsEl.innerHTML = '';
  cardsEl.style.display = 'grid';

  models.forEach((m, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${i * 22}ms`;

    const thumb = m.thumbnail_url || '';
    const tags = (m.tags || []).slice(0, 3).map(t => `<span class="cpill">${esc(t)}</span>`).join('');
    const sizeTxt =
      m.file_size_mb != null ? m.file_size_mb + ' MB' :
      m.glb_size_mb != null ? m.glb_size_mb + ' MB' : '—';

    card.innerHTML = `
      <div class="cthumb">
        ${thumb ? `<img src="${thumb}" alt="${esc(m.name)}" loading="lazy" onerror="this.style.display='none';this.nextSibling.style.display='flex'">` : ''}
        <div class="cnoimg" style="display:${thumb ? 'none' : 'flex'}">📦</div>
        ${m.has_glb ? '<div class="cbadge">3D · GLB</div>' : '<div class="cbadge" style="background:var(--ink3)">IMG</div>'}
      </div>
      <div class="cbody">
        <div class="ctitle">${esc(m.name || m.slug || 'Untitled')}</div>
        <div class="ccats">${esc(m.category || '—')}</div>
        <div class="crow">📦 ${sizeTxt}</div>
        <div class="crow">⬇ ${Number(m.download_count || 0).toLocaleString()}</div>
        <div class="cpills">${tags}</div>
      </div>`;

    card.onclick = () => onClick(m);
    cardsEl.appendChild(card);
  });
}

export function renderAggregation(data) {
  const aggEl = $('agglist');
  aggEl.innerHTML = '';
  aggEl.style.display = 'flex';

  const vk = Object.keys(data[0]).find(k => k !== '_id' && typeof data[0][k] === 'number') || 'count';
  const mx = Math.max(...data.map(d => +(d[vk] || 0)));

  data.forEach((row, i) => {
    const v = +(row[vk] || 0);
    const el = document.createElement('div');
    el.className = 'arow';
    el.style.animationDelay = `${i * 40}ms`;
    const extra = row.count && vk !== 'count' ? ` <span style="font-size:9px;color:var(--ink3)">(${row.count})</span>` : '';
    el.innerHTML = `
      <span class="arn">${i + 1}</span>
      <span class="alb">${esc(String(row._id ?? 'Unknown'))}${extra}</span>
      <div class="abar"><div class="afill" data-p="${(v / mx * 100).toFixed(1)}"></div></div>
      <span class="asc">${v % 1 === 0 ? v.toLocaleString() : v.toFixed(1)}</span>`;

    aggEl.appendChild(el);
    setTimeout(() => {
      const f = el.querySelector('.afill');
      if (f) f.style.width = f.dataset.p + '%';
    }, 80 + i * 40);
  });
}

export function renderResults(data, tag, count, ms, onCardClick) {
  $('empty').style.display = 'none';
  $('cards').style.display = 'none';
  $('agglist').style.display = 'none';

  renderBadge(tag);
  $('rcnt').textContent = `${count} result${count !== 1 ? 's' : ''}`;
  $('rtime').textContent = ms ? `${ms}ms` : '';

  if (isAggregation(data)) {
    renderAggregation(data);
  } else {
    renderCards(Array.isArray(data) ? data : [], onCardClick);
  }

  if (count === 0) showEmpty('No documents matched this query.');
}

export function showLoad() {
  $('empty').style.display = 'none';
  $('cards').style.display = 'none';
  $('agglist').style.display = 'none';
  $('loading').style.display = 'flex';
}

export function hideLoad() {
  $('loading').style.display = 'none';
}

export function showEmpty(msg) {
  const e = $('empty');
  e.style.display = 'flex';
  e.querySelector('p').textContent = msg;
}

export function updateProgressBar(pct, label) {
  $('pf').style.width = pct + '%';
  $('pl').textContent = label;
}

export function updateLessonListItem(i, done) {
  const el = $(`li${i}`);
  const c = el?.querySelector('.lck');
  if (c) c.textContent = done ? '✓' : '○';
  el?.classList.toggle('done', done);
}