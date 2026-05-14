function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const $ = id => document.getElementById(id);

export async function open(m, viewer) {
  $('cvwrap').classList.remove('show', 'fullscreen');
  $('mimgwrap').classList.remove('show');
  $('mimg').src = '';
  $('cvinfo').innerHTML = '';

  $('mname').textContent = m.name || m.slug || 'Untitled';
  $('msub').textContent = [m.category, m.complexity, m.license].filter(Boolean).join(' · ').toUpperCase();
  $('mtags').innerHTML = (m.tags || []).map(t => `<span class="mtag">${esc(t)}</span>`).join('');
  $('m-size').textContent = m.file_size_mb != null ? m.file_size_mb + ' MB' : m.glb_size_mb != null ? m.glb_size_mb + ' MB' : '—';
  $('m-dl').textContent = m.download_count ? Number(m.download_count).toLocaleString() : '—';
  $('m-date').textContent = m.year_published || '—';
  $('mauthors').innerHTML = m.author ? `<strong>Author</strong><br>${esc(m.author)}` : '';

  renderLinks(m);
  renderSnapshot(m);
  $('mb').classList.add('open');

  const container = $('cvwrap');
  const canvas = $('threeCanvas');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;

  if (m.has_glb && m.glb_url) {
    try {
      $('cvwrap').classList.add('show');
      $('cvloader').style.display = 'flex';
      await viewer.loadModel(m.glb_url, container);
      $('cvloader').style.display = 'none';
    } catch (err) {
      console.warn('GLB load failed, showing image instead:', err);
      viewer.stop();
      showImage(m.thumbnail_url);
    }
  } else {
    showImage(m.thumbnail_url);
  }
}

function renderLinks(m) {
  const links = $('mlinks');
  links.innerHTML = '';

  if (m.has_glb && m.glb_url) {
    const a = document.createElement('a');
    a.className = 'mlink';
    a.href = m.glb_url;
    a.target = '_blank';
    a.textContent = '↗ Download GLB';
    links.appendChild(a);
  }
  if (m.source === 'polyhaven' && m.slug) {
    const a = document.createElement('a');
    a.className = 'mlink';
    a.href = `https://polyhaven.com/a/${m.original_slug || m.slug}`;
    a.target = '_blank';
    a.textContent = '↗ View on Poly Haven';
    links.appendChild(a);
  }
  if (m.source === 'khronos' && m.original_slug) {
    const a = document.createElement('a');
    a.className = 'mlink';
    a.href = `https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/${m.original_slug}`;
    a.target = '_blank';
    a.textContent = '↗ Khronos Repository';
    links.appendChild(a);
  }
}

function renderSnapshot(m) {
  const snap = {
    slug: m.slug, name: m.name, source: m.source, category: m.category, tags: m.tags,
    complexity: m.complexity, poly_count: m.poly_count, file_size_mb: m.file_size_mb,
    download_count: m.download_count, popularity_tier: m.popularity_tier,
    has_animations: m.has_animations, has_pbr: m.has_pbr, has_glb: m.has_glb, license: m.license,
  };
  $('mraw').textContent = JSON.stringify(snap, null, 2);
}

export function showImage(url) {
  if (!url) return;
  $('mimgwrap').classList.add('show');
  $('mimg').src = url;
}

export function close(viewer) {
  $('mb').classList.remove('open');
  $('cvwrap').classList.remove('fullscreen');
  $('cvfull').textContent = '⛶ Fullscreen';
  viewer.stop();
}

export function toggleFullscreen(viewer) {
  const wrap = $('cvwrap');
  const isFs = wrap.classList.toggle('fullscreen');
  $('cvfull').textContent = isFs ? '✕ Exit' : '⛶ Fullscreen';
  viewer.resize(wrap.clientWidth, wrap.clientHeight);
}