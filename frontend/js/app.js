import { LESSONS } from '../data/lessons.js';
import * as state from './state.js';
import * as api from './api.js';
import * as renderer from './renderer.js';
import * as viewer from './viewer3d.js';
import * as modal from './modal.js';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const $ = id => document.getElementById(id);

function tlog(type, msg) {
  const d = document.createElement('div');
  d.className = 'tl';
  const map = { ok: ['tok', '✓'], err: ['terr', '✗'], inf: ['tinf', ''], cm: ['tcmt', ''], q: ['tc', 'mongosh>'] };
  const [cls, pr] = map[type] || ['tc', ''];
  d.innerHTML = pr
    ? `<span class="tp">${esc(pr)}</span><span class="${cls}">${esc(msg)}</span>`
    : `<span class="${cls}" style="padding-left:18px">${esc(msg)}</span>`;
  $('tout').appendChild(d);
  $('tout').scrollTop = 99999;
}

export function toggleTheme() {
  const h = document.documentElement;
  const dark = h.getAttribute('data-theme') === 'dark';
  h.setAttribute('data-theme', dark ? 'light' : 'dark');
  $('thbtn').textContent = dark ? '☾' : '☀';
}

export function clearTerm() {
  $('tout').innerHTML = '<div class="tl"><span class="tinf" style="padding-left:0">Cleared.</span></div>';
}

export function pickLesson(i) {
  const lesson = { ...LESSONS[i], idx: i };
  state.setCurrent(lesson);

  document.querySelectorAll('.li').forEach((el, j) => el.classList.toggle('active', j === i));
  $('gicon').textContent = LESSONS[i].icon;
  $('gtitle').textContent = LESSONS[i].name;
  $('gdesc').textContent = LESSONS[i].desc;
  $('gcmd').textContent = LESSONS[i].cmd;
  $('btnrun').disabled = false;
  tlog('cm', `// Lesson ${i + 1}: ${LESSONS[i].name}`);
}

export async function runLesson() {
  const current = state.getState().current;
  if (!current) return;

  const l = current;
  tlog('q', l.cmd.split('\n')[0] + (l.cmd.includes('\n') ? ' …' : ''));
  renderer.showLoad();
  const t0 = Date.now();

  try {
    const data = await api.queryLesson(l.op, l.filter, l.opts || {});
    const n = Array.isArray(data.result) ? data.result.length : data.count;
    state.setResults(data.result || []);
    tlog('ok', `${n} document(s) — ${Date.now() - t0}ms`);
    state.markDone(l.idx);
    updateProgress();
    renderer.renderResults(data.result || [], l.tag, n, Date.now() - t0, openModel);
  } catch (e) {
    tlog('err', e.message);
    renderer.hideLoad();
    renderer.showEmpty(e.message);
  }
}

export async function runCustom() {
  const raw = $('tinp').value.trim();
  if (!raw) return;
  $('tinp').value = '';
  tlog('q', raw);

  const parsed = api.parseCustomQuery(raw);
  if (!parsed) {
    tlog('inf', 'Try: db.models.find({source:"khronos"}) or db.models.countDocuments({has_glb:true})');
    return;
  }

  renderer.showLoad();
  try {
    const data = await api.request(parsed.operation, parsed.filter, parsed.options);
    const n = Array.isArray(data.result) ? data.result.length : data.count;
    state.setResults(data.result || []);
    tlog('ok', `${n} document(s) returned`);
    renderer.renderResults(data.result || n, 'FIND', n, 0, openModel);
  } catch (e) {
    renderer.hideLoad();
    tlog('err', e.message);
  }
}

async function openModel(m) {
  await modal.open(m, viewer);
}

function updateProgress() {
  const { done, total, pct } = state.getProgress();
  renderer.updateProgressBar(pct, `${done} / ${total} completed`);

  LESSONS.forEach((_, i) => {
    renderer.updateLessonListItem(i, state.isDone(i));
  });

  if (state.isAllDone()) {
    $('popup').classList.add('show');
    $('popup-overlay').classList.add('show');
  }
}

export function closePopup() {
  $('popup').classList.remove('show');
  $('popup-overlay').classList.remove('show');
}

export function bgClose(e) {
  if (e.target.id === 'mb') modal.close(viewer);
}

export function closeModal() {
  modal.close(viewer);
}

export function toggleFullscreen() {
  modal.toggleFullscreen(viewer);
}

export function setupViewerControls() {
  $('cvreset')?.addEventListener('click', () => viewer.resetView());
  $('cvwire')?.addEventListener('click', () => viewer.toggleWireframe());
  $('cvautorot')?.addEventListener('click', function() {
    const on = viewer.toggleAutoRotate();
    this.classList.toggle('active', on);
  });
  $('cvexp')?.addEventListener('input', e => viewer.setExposure(parseFloat(e.target.value)));
}

export async function init() {
  renderLessonList();
  try {
    const d = await api.getStats();
    $('sdot').classList.add('on');
    $('slab').textContent = 'Connected · assetsDB';
    $('ncnt').textContent = d.total.toLocaleString() + ' models';
    tlog('ok', `Connected · ${d.total.toLocaleString()} models · Khronos GLBs + Poly Haven metadata`);
  } catch {
    $('slab').textContent = 'Offline';
    tlog('err', 'Cannot reach localhost:3001 — run: node server.js');
  }
}

function renderLessonList() {
  LESSONS.forEach((l, i) => {
    const el = document.createElement('div');
    el.className = 'li';
    el.id = `li${i}`;
    el.innerHTML = `<span class="lck">○</span><span class="ln">${l.icon} ${l.name}</span><span class="ltg ${l.tc}">${l.tag}</span>`;
    el.onclick = () => pickLesson(i);
    $('llist').appendChild(el);
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const wrap = $('cvwrap');
    if (wrap?.classList.contains('fullscreen')) { toggleFullscreen(); return; }
    closeModal();
    closePopup();
  }
});