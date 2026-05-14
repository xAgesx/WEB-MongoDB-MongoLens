const THREE = window.THREE;
let renderer, scene, camera, model, animId;
let sph = { theta: 0.4, phi: 1.1, r: 3.5 };
let autoRotate = true;
let isDragging = false;
let prevMouse = { x: 0, y: 0 };
let onMouseUpHandler, onMouseMoveHandler;
let onResizeHandler;

const DEFAULT_SPH = { theta: 0.4, phi: 1.1, r: 3.5 };
const MIN_R = 0.3, MAX_R = 15;

export function init(container) {
  const w = container.clientWidth, h = container.clientHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080808);
  scene.fog = new THREE.FogExp2(0x080808, 0.05);

  camera = new THREE.PerspectiveCamera(45, w / h, 0.001, 1000);

  renderer = new THREE.WebGLRenderer({ canvas: container.querySelector('canvas'), antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.physicallyCorrectLights = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  setupLights();
  setupGrid();
  setupControls(container);

  onResizeHandler = () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', onResizeHandler);

  updateCamera();
  startLoop();
}

function setupLights() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  const key = new THREE.DirectionalLight(0xfff0dd, 2.5);
  key.position.set(5, 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 50;
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  key.shadow.bias = -0.0005;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xd0e8ff, 0.8);
  fill.position.set(-6, 3, -4);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffe0c0, 0.5);
  rim.position.set(0, 2, -8);
  scene.add(rim);

  const hemi = new THREE.HemisphereLight(0x404060, 0x101015, 0.3);
  scene.add(hemi);
}

function setupGrid() {
  const grid = new THREE.GridHelper(10, 20, 0x222222, 0x181818);
  grid.position.y = -1.5;
  grid.material.transparent = true;
  grid.material.opacity = 0.4;
  scene.add(grid);

  const axisHelper = new THREE.AxesHelper(1.5);
  axisHelper.position.set(-3.5, -1.5, -3.5);
  scene.add(axisHelper);
}

function updateCamera() {
  const { theta, phi, r } = sph;
  camera.position.set(
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.cos(theta)
  );
  camera.lookAt(0, 0, 0);
}

function startLoop() {
  const loop = () => {
    animId = requestAnimationFrame(loop);
    if (model && autoRotate && !isDragging) {
      model.rotation.y += 0.004;
    }
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  };
  loop();
}

function setupControls(container) {
  container.addEventListener('mousedown', e => {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };
    container.style.cursor = 'grabbing';
  });

  onMouseUpHandler = () => {
    isDragging = false;
    container.style.cursor = 'grab';
  };
  window.addEventListener('mouseup', onMouseUpHandler);

  onMouseMoveHandler = e => {
    if (!isDragging) return;
    const dx = (e.clientX - prevMouse.x) * 0.008;
    const dy = (e.clientY - prevMouse.y) * 0.008;
    sph.theta -= dx;
    sph.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sph.phi + dy));
    prevMouse = { x: e.clientX, y: e.clientY };
    updateCamera();
  };
  window.addEventListener('mousemove', onMouseMoveHandler);

  container.addEventListener('wheel', e => {
    sph.r = Math.max(MIN_R, Math.min(MAX_R, sph.r + e.deltaY * 0.006));
    updateCamera();
    e.preventDefault();
  }, { passive: false });

  let lastPinch = 0;
  container.addEventListener('touchstart', e => {
    e.preventDefault();
    if (e.touches.length === 1) {
      isDragging = true;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      lastPinch = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: false });

  container.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      const dx = (e.touches[0].clientX - prevMouse.x) * 0.008;
      const dy = (e.touches[0].clientY - prevMouse.y) * 0.008;
      sph.theta -= dx;
      sph.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sph.phi + dy));
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      updateCamera();
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      sph.r = Math.max(MIN_R, Math.min(MAX_R, sph.r - (dist - lastPinch) * 0.01));
      lastPinch = dist;
      updateCamera();
    }
  }, { passive: false });

  container.addEventListener('touchend', () => { isDragging = false; });

  container.style.cursor = 'grab';
}

export async function loadModel(url, container) {
  if (!scene) init(container);

  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (model) {
    scene.remove(model);
    model.traverse(ch => {
      if (ch.geometry) ch.geometry.dispose();
      if (ch.material) {
        if (Array.isArray(ch.material)) ch.material.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
        else { if (ch.material.map) ch.material.map.dispose(); ch.material.dispose(); }
      }
    });
    model = null;
  }

  sph = { ...DEFAULT_SPH };
  updateCamera();

  return new Promise((resolve, reject) => {
    const loader = new THREE.GLTFLoader();
    loader.load(url, gltf => {
      model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const scale = 2.0 / Math.max(size.x, size.y, size.z, 0.001);
      model.scale.setScalar(scale);
      model.position.sub(center.clone().multiplyScalar(scale));

      const info = getModelInfo(gltf, size);
      setViewerInfo(info);

      model.traverse(ch => {
        if (ch.isMesh) {
          ch.castShadow = true;
          ch.receiveShadow = true;
          if (ch.material) {
            if (!Array.isArray(ch.material)) ch.material = [ch.material];
            ch.material.forEach(m => {
              if (m.metalness === undefined) m.metalness = 0.3;
              if (m.roughness === undefined) m.roughness = 0.7;
            });
          }
        }
      });

      scene.add(model);
      resolve(info);
    }, undefined, err => reject(err));
  });
}

function getModelInfo(gltf, size) {
  let triCount = 0, vertCount = 0;
  gltf.scene.traverse(ch => {
    if (ch.isMesh && ch.geometry) {
      const idx = ch.geometry.index;
      triCount += idx ? idx.count / 3 : ch.geometry.attributes.position.count / 3;
      vertCount += ch.geometry.attributes.position?.count || 0;
    }
  });
  return {
    vertices: vertCount.toLocaleString(),
    triangles: Math.round(triCount).toLocaleString(),
    bounds: `${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)}`
  };
}

export function setViewerInfo(info) {
  const el = document.getElementById('cvinfo');
  if (el && info) {
    el.innerHTML = `<span>V: ${info.vertices}</span><span>T: ${info.triangles}</span><span>${info.bounds}</span>`;
  }
}

export function resetView() {
  sph = { ...DEFAULT_SPH };
  updateCamera();
}

export function toggleWireframe() {
  if (!model) return;
  model.traverse(ch => {
    if (ch.isMesh && ch.material) {
      const mats = Array.isArray(ch.material) ? ch.material : [ch.material];
      mats.forEach(m => { m.wireframe = !m.wireframe; });
    }
  });
}

export function toggleAutoRotate() {
  autoRotate = !autoRotate;
  return autoRotate;
}

export function setExposure(val) {
  if (renderer) renderer.toneMappingExposure = val;
}

export function stop() {
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (onMouseUpHandler) { window.removeEventListener('mouseup', onMouseUpHandler); onMouseUpHandler = null; }
  if (onMouseMoveHandler) { window.removeEventListener('mousemove', onMouseMoveHandler); onMouseMoveHandler = null; }
  if (onResizeHandler) { window.removeEventListener('resize', onResizeHandler); onResizeHandler = null; }
  if (renderer) { renderer.dispose(); renderer = null; }
  model = null;
  scene = null;
  camera = null;
}

export function resize(w, h) {
  if (!renderer || !camera) return;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}