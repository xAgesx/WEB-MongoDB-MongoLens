

const { MongoClient } = require('mongodb');
const URI = process.env.MONGO_URI || 'mongodb://admin:password123@localhost:27017/?authSource=admin';

const KHRONOS_MODELS = [
  { slug:'Avocado',               category:'Food & Organic',   tags:['food','fruit','organic','pbr'],         complexity:'low',    poly:1822,   kb:1316 },
  { slug:'Duck',                  category:'Animals',          tags:['toy','animal','classic','pbr'],         complexity:'low',    poly:4212,   kb:162  },
  { slug:'Lantern',               category:'Furniture',        tags:['light','antique','metal','emissive'],   complexity:'medium', poly:3578,   kb:924  },
  { slug:'WaterBottle',           category:'Household',        tags:['container','metal','pbr','product'],    complexity:'low',    poly:2520,   kb:713  },
  { slug:'DamagedHelmet',         category:'Wearable',         tags:['sci-fi','damaged','pbr','helmet'],      complexity:'medium', poly:15184,  kb:8204 },
  { slug:'ToyCar',                category:'Vehicles',         tags:['toy','vehicle','pbr','product'],        complexity:'medium', poly:12600,  kb:3220 },
  { slug:'Corset',                category:'Fashion',          tags:['clothing','historical','fabric'],       complexity:'high',   poly:18000,  kb:7240 },
  { slug:'DragonAttenuation',     category:'Fantasy',          tags:['dragon','translucent','volume'],        complexity:'high',   poly:28000,  kb:3100 },
  { slug:'IridescenceLamp',       category:'Furniture',        tags:['lamp','iridescence','pbr'],             complexity:'medium', poly:5400,   kb:2800 },
  { slug:'MaterialsVariantsShoe', category:'Fashion',          tags:['shoe','wearable','variants','pbr'],     complexity:'medium', poly:9200,   kb:3600 },
  { slug:'SheenChair',            category:'Furniture',        tags:['chair','fabric','sheen','interior'],    complexity:'medium', poly:7800,   kb:2100 },
  { slug:'GlassVaseFlowers',      category:'Food & Organic',   tags:['glass','flowers','transparent'],        complexity:'high',   poly:22000,  kb:5800 },
  { slug:'ReciprocatingSaw',      category:'Tools',            tags:['tool','mechanical','animated'],         complexity:'high',   poly:24800,  kb:5300 },
  { slug:'RiggedFigure',          category:'Characters',       tags:['rigged','humanoid','animated'],         complexity:'medium', poly:3600,   kb:220  },
  { slug:'CesiumMilkTruck',       category:'Vehicles',         tags:['truck','vehicle','animated'],           complexity:'low',    poly:3932,   kb:516  },
  { slug:'CesiumMan',             category:'Characters',       tags:['humanoid','animated','rigged'],         complexity:'low',    poly:3600,   kb:228  },
  { slug:'VC',                    category:'Vehicles',         tags:['aircraft','vehicle','complex'],         complexity:'high',   poly:35600,  kb:8920 },
  { slug:'Buggy',                 category:'Vehicles',         tags:['buggy','offroad','vehicle'],            complexity:'high',   poly:43800,  kb:5028 },
  { slug:'2CylinderEngine',       category:'Mechanical',       tags:['engine','mechanical','industrial'],     complexity:'high',   poly:48000,  kb:1212 },
  { slug:'GearboxAssy',           category:'Mechanical',       tags:['gears','mechanical','industrial'],      complexity:'high',   poly:64000,  kb:2600 },
  { slug:'FlightHelmet',          category:'Wearable',         tags:['helmet','aviator','detailed','pbr'],    complexity:'high',   poly:52000,  kb:78000},
  { slug:'SciFiHelmet',           category:'Wearable',         tags:['sci-fi','helmet','pbr','detailed'],     complexity:'high',   poly:14556,  kb:13400},
  { slug:'BrainStem',             category:'Medical',          tags:['anatomy','rigged','complex'],           complexity:'high',   poly:36000,  kb:3500 },
  { slug:'Sponza',                category:'Architecture',     tags:['scene','architecture','interior'],      complexity:'high',   poly:279280, kb:52000},
  { slug:'SuzanneSubdivision4',   category:'Characters',       tags:['blender','monkey','subdiv'],            complexity:'high',   poly:96000,  kb:3400 },
  { slug:'AnisotropyBarnLamp',    category:'Furniture',        tags:['lamp','anisotropy','metal'],            complexity:'medium', poly:8400,   kb:3200 },
  { slug:'IridescenceMetallicSpheres',category:'Materials',   tags:['iridescence','metal','spheres','pbr'],  complexity:'low',    poly:11520,  kb:680  },
  { slug:'MetalRoughSpheresNoTextures',category:'Materials',  tags:['pbr','metal','roughness','test'],       complexity:'low',    poly:18720,  kb:1080 },
  { slug:'ClearCoatTest',         category:'Materials',        tags:['clearcoat','pbr','car-paint'],          complexity:'low',    poly:1080,   kb:448  },
  { slug:'TransmissionRoughnessTest',category:'Materials',    tags:['glass','transmission','transparent'],    complexity:'low',    poly:960,    kb:560  },
  { slug:'LightsPunctualLamp',    category:'Furniture',        tags:['lamp','lights','pbr','metal'],          complexity:'medium', poly:6200,   kb:1840 },
  { slug:'AttenuationTest',       category:'Materials',        tags:['volume','attenuation','glass'],         complexity:'low',    poly:600,    kb:432  },
  { slug:'EmissiveStrengthTest',  category:'Materials',        tags:['emissive','glow','pbr'],                complexity:'low',    poly:720,    kb:192  },
  { slug:'BoxAnimated',           category:'Primitives',       tags:['box','animated','simple'],              complexity:'low',    poly:24,     kb:24   },
  { slug:'AnimatedMorphCube',     category:'Primitives',       tags:['morph','animated','cube'],              complexity:'low',    poly:960,    kb:76   },
  { slug:'RiggedSimple',          category:'Characters',       tags:['rigged','simple','animated'],           complexity:'low',    poly:800,    kb:92   },
  { slug:'MorphPrimitivesTest',   category:'Primitives',       tags:['morph','test','geometry'],              complexity:'low',    poly:2400,   kb:148  },
  { slug:'Sphere',                category:'Primitives',       tags:['basic','geometry','sphere'],            complexity:'low',    poly:960,    kb:88   },
  { slug:'Box',                   category:'Primitives',       tags:['box','basic','geometry'],               complexity:'low',    poly:12,     kb:20   },
  { slug:'NegativeScaleTest',     category:'Primitives',       tags:['test','geometry','scale'],              complexity:'low',    poly:720,    kb:44   },
  { slug:'OrientationTest',       category:'Primitives',       tags:['orientation','axes','test'],            complexity:'low',    poly:480,    kb:120  },
  { slug:'UnlitTest',             category:'Materials',        tags:['unlit','flat','test'],                  complexity:'low',    poly:480,    kb:204  },
  { slug:'MultiUVTest',           category:'Materials',        tags:['uv','texture','test'],                  complexity:'low',    poly:120,    kb:1200 },
  { slug:'TextureCoordinateTest', category:'Materials',        tags:['texture','uv','coordinates'],           complexity:'low',    poly:240,    kb:448  },
  { slug:'XmpMetadataRoundedCube',category:'Primitives',       tags:['cube','rounded','metadata'],            complexity:'low',    poly:1536,   kb:328  },
  { slug:'MeshPrimitiveModes',    category:'Primitives',       tags:['mesh','geometry','test'],               complexity:'low',    poly:540,    kb:28   },
  { slug:'InterpolationTest',     category:'Primitives',       tags:['animation','interpolation','test'],     complexity:'low',    poly:960,    kb:64   },
  { slug:'Cameras',               category:'Primitives',       tags:['cameras','test','simple'],              complexity:'low',    poly:240,    kb:32   },
];

const BASE = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models';
const LICENSES = ['CC0','CC-BY','CC-BY-SA','MIT','Apache-2.0'];
const AUTHORS  = ['Khronos Group','UX3D','Cesium','Microsoft','Google','Sketchfab','Community'];
const RENDERERS= ['Three.js','Babylon.js','PlayCanvas','CesiumJS','Godot','Unity','Unreal'];
const APPS     = ['Three.js','Babylon.js','PlayCanvas','A-Frame','Godot','Unity','Sketchfab','CesiumJS','Filament'];

function nameToTitle(slug) {
  return slug.replace(/([A-Z])/g,' $1').trim().replace(/\s+/g,' ');
}

function buildKhronosDoc(base, variant) {
  const r = Math.random;
  const year = 2018 + (variant % 6);
  const dlBase = base.kb * 8;
  return {
    source:         'khronos',
    slug:           variant === 0 ? base.slug : `${base.slug}_v${variant+1}`,
    original_slug:  base.slug,
    name:           variant === 0 ? nameToTitle(base.slug) : `${nameToTitle(base.slug)} (Variant ${variant+1})`,
    category:       base.category,
    tags:           base.tags,
    complexity:     base.complexity,
    complexity_score: {low:1,medium:2,high:3}[base.complexity],
    poly_count:     Math.floor(base.poly * (0.85 + r()*0.3)),
    file_size_kb:   Math.floor(base.kb  * (0.9  + r()*0.2)),
    file_size_mb:   parseFloat((base.kb / 1024 * (0.9 + r()*0.2)).toFixed(2)),
    year_published: year,
    license:        LICENSES[Math.floor(r()*LICENSES.length)],
    author:         AUTHORS[Math.floor(r()*AUTHORS.length)],
    // 3D model
    has_glb:        true,
    glb_url:        `${BASE}/${base.slug}/glTF-Binary/${base.slug}.glb`,
    thumbnail_url:  `${BASE}/${base.slug}/screenshot/screenshot.jpg`,
    // Stats
    download_count: Math.floor(dlBase * (0.5 + r()*2)),
    rating:         parseFloat((3.5 + r()*1.5).toFixed(1)),
    rating_votes:   Math.floor(20 + r()*500),
    popularity_tier: base.kb > 5000 ? 'high' : base.kb > 1000 ? 'medium' : 'low',
    // Feature flags
    has_animations: base.tags.some(t=>['animated','rigged','morph'].includes(t)),
    has_pbr:        base.tags.includes('pbr') || base.tags.includes('metal'),
    is_rigged:      base.tags.includes('rigged'),
    renderer_tested: RENDERERS.filter(()=>r()>.5),
    compatible_apps: APPS.filter(()=>r()>.45),
    description: `A ${base.complexity}-complexity ${base.category.toLowerCase()} asset from the Khronos glTF Sample Assets repository. Demonstrates ${base.tags.slice(0,3).join(', ')} features of the glTF 2.0 specification.`,
  };
}

//SOURCE B: Poly Haven metadata 
async function fetchPolyHaven() {
  try {
    console.log('Fetching Poly Haven model list...');
    const res = await fetch('https://api.polyhaven.com/assets?type=models', {
      headers: { 'User-Agent': 'MongoLens/1.0 (educational project, Big Data class)' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const docs = [];
    for (const [slug, m] of Object.entries(data)) {
      docs.push({
        source:         'polyhaven',
        slug,
        original_slug:  slug,
        name:           (m.name || slug.replace(/_/g,' ')).replace(/\b\w/g,c=>c.toUpperCase()),
        category:       (m.categories||['uncategorized'])[0],
        tags:           m.tags || [],
        complexity:     'medium',
        complexity_score: 2,
        poly_count:     null,
        file_size_kb:   null,
        file_size_mb:   null,
        year_published: m.date_published ? new Date(m.date_published*1000).getFullYear() : null,
        license:        'CC0',
        author:         Object.keys(m.authors||{})[0] || 'Poly Haven',
        has_glb:        false,
        glb_url:        null,
        thumbnail_url:  `https://cdn.polyhaven.com/asset_img/thumbs/${slug}.png?width=512`,
        // Stats
        download_count: m.download_count || 0,
        rating:         null,
        rating_votes:   0,
        popularity_tier: (m.download_count||0) > 10000 ? 'high' : (m.download_count||0) > 2000 ? 'medium' : 'low',
        has_animations: (m.tags||[]).includes('animated'),
        has_pbr:        true,
        is_rigged:      false,
        renderer_tested: ['Blender Cycles','Blender EEVEE'],
        compatible_apps: ['Blender','Maya','3ds Max','Cinema 4D'],
        description: `A photorealistic CC0 3D model from Poly Haven. Available in multiple resolutions and formats.`,
      });
    }
    console.log(`Got ${docs.length} Poly Haven records`);
    return docs;
  } catch(e) {
    console.warn(`Poly Haven fetch failed (${e.message}) — skipping, using Khronos only`);
    return [];
  }
}

async function fetchSketchfabModels() {
  const queries = [
    'robot', 'dragon', 'car', 'character', 'tree', 'house', 'sword', 'spaceship',
    'animal', 'weapon', 'furniture', 'building', 'nature', 'human', 'sci-fi',
    'fantasy', 'landscape', 'vehicle', 'architecture', 'creature', 'monster',
    'environment', 'prop', 'food', 'city', 'medieval', 'mechanical', 'organic'
  ];
  const docs = [];
  const seen = new Set();
  
  for (const q of queries) {
    if (docs.length >= 300) break;
    let cursor = null;
    let page = 0;
    
    while (page < 3 && docs.length < 300) {
      try {
        const url = cursor
          ? `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(q)}&count=50&pbr=true&cursor=${cursor}`
          : `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(q)}&count=50&pbr=true`;
        console.log(`Fetching Sketchfab: ${q} (page ${page+1})...`);
        const res = await fetch(url, {
          headers: { 'User-Agent': 'MongoLens/1.0' }
        });
        if (!res.ok) break;
        const data = await res.json();
        
        for (const m of data.results || []) {
          if (seen.has(m.uid)) continue;
          if (docs.length >= 300) break;
          seen.add(m.uid);
          
          const thumbImg = m.thumbnails?.images?.[0];
          const thumb = thumbImg?.url?.replace(/thumb_\d+/, 'thumb_512') || thumbImg?.url || '';
          const r = Math.random;
          
          docs.push({
            source:         'sketchfab',
            slug:           m.uid,
            original_slug:  m.uid,
            name:           m.name,
            category:       (m.categories?.[0]?.name || 'uncategorized').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            tags:           m.tags?.map(t => t.name) || [],
            complexity:     m.vertexCount > 50000 ? 'high' : m.vertexCount > 10000 ? 'medium' : 'low',
            complexity_score: m.vertexCount > 50000 ? 3 : m.vertexCount > 10000 ? 2 : 1,
            poly_count:     m.vertexCount || null,
            file_size_kb:   null,
            file_size_mb:   null,
            year_published: 2018 + Math.floor(r() * 6),
            license:        m.license?.fullName || 'Standard',
            author:         m.creator?.displayName || 'Sketchfab User',
            has_glb:        false,
            glb_url:        null,
            thumbnail_url:  thumb,
            download_count: m.viewCount || Math.floor(r() * 50000),
            rating:         m.viewerRating || null,
            rating_votes:   m.likeCount || 0,
            popularity_tier: (m.viewCount || 0) > 10000 ? 'high' : (m.viewCount || 0) > 2000 ? 'medium' : 'low',
            has_animations: m.animated || false,
            has_pbr:        true,
            is_rigged:      false,
            renderer_tested: ['Sketchfab Viewer'],
            compatible_apps: ['Blender', 'Three.js', 'Babylon.js'],
            description:    m.description?.substring(0, 200) || '',
            sketchfab_url:   m.viewerUrl || `https://sketchfab.com/3d-models/${m.uid}`,
            embed_url:      m.embedUrl || null,
          });
        }
        
        cursor = data.next;
        if (!cursor) break;
        
        await new Promise(r => setTimeout(r, 400));
        page++;
      } catch(e) {
        console.warn(`Sketchfab page failed: ${e.message}`);
        break;
      }
    }
    
    await new Promise(r => setTimeout(r, 600));
  }
  
  console.log(`Got ${docs.length} Sketchfab records`);
  return docs;
}

async function fetchModelViewerModels() {
  const r = Math.random;
  
  const MODEL_VIEWER_MODELS = [
    { name:'Astronaut',        slug:'Astronaut',        category:'Characters',    tags:['astronaut','space','character','rigged'],     glb:'https://modelviewer.dev/shared-assets/models/Astronaut.glb',     thumb:'https://modelviewer.dev/shared-assets/models/Astronaut.webp',     poly:15000 },
    { name:'Horse',            slug:'Horse',            category:'Animals',        tags:['horse','animal','organic','pbr'],             glb:'https://modelviewer.dev/shared-assets/models/Horse.glb',         thumb:'https://modelviewer.dev/shared-assets/models/Horse.webp',         poly:25000 },
    { name:'Neil Armstrong',   slug:'NeilArmstrong',    category:'Characters',    tags:['astronaut','space','character','rigged'],     glb:'https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb',  thumb:'https://modelviewer.dev/shared-assets/models/NeilArmstrong.webp',  poly:22000 },
    { name:'Robot Expressive',slug:'RobotExpressive',  category:'Characters',    tags:['robot','sci-fi','character','rigged','pbr'], glb:'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',thumb:'https://modelviewer.dev/shared-assets/models/RobotExpressive.webp',poly:35000 },
    { name:'Plane',           slug:'Plane',            category:'Vehicles',       tags:['plane','aircraft','vehicle','pbr'],           glb:'https://modelviewer.dev/shared-assets/models/SheenChair.glb',     thumb:'https://modelviewer.dev/shared-assets/models/SheenChair.webp',     poly:8000  },
    { name:'Damaged Helmet',   slug:'DamagedHelmet',    category:'Wearable',      tags:['helmet','sci-fi','pbr'],                     glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb', thumb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/screenshot/screenshot.jpg', poly:15000 },
    { name:'Duck',             slug:'Duck',             category:'Animals',        tags:['duck','toy','animal','classic','pbr'],       glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb', thumb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/screenshot/screenshot.jpg', poly:4000 },
    { name:'Lantern',          slug:'Lantern',          category:'Furniture',      tags:['lantern','light','antique','metal','pbr'],   glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb', thumb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/screenshot/screenshot.jpg', poly:3600 },
    { name:'Water Bottle',     slug:'WaterBottle',      category:'Household',      tags:['bottle','container','metal','pbr'],          glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb', thumb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/screenshot/screenshot.jpg', poly:2500 },
    { name:'Toy Car',          slug:'ToyCar',           category:'Vehicles',       tags:['car','toy','vehicle','pbr'],                glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb', thumb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/screenshot/screenshot.jpg', poly:12600 },
    { name:'Flight Helmet',     slug:'FlightHelmet',     category:'Wearable',      tags:['helmet','aviator','detailed','pbr'],        glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/FlightHelmet/glTF-Binary/FlightHelmet.glb', thumb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/FlightHelmet/screenshot/screenshot.jpg', poly:52000 },
    { name:'Box Animated',     slug:'BoxAnimated',      category:'Primitives',    tags:['box','animated','simple'],                  glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BoxAnimated/glTF-Binary/BoxAnimated.glb', thumb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BoxAnimated/screenshot/screenshot.jpg', poly:24 },
    { name:'Sheen Chair',      slug:'SheenChair',        category:'Furniture',      tags:['chair','fabric','sheen','interior','pbr'],  glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb', thumb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/screenshot/screenshot.jpg', poly:7800 },
    { name:'Glass Vase',       slug:'GlassVaseFlowers', category:'Food & Organic', tags:['glass','vase','transparent','pbr'],         glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GlassVaseFlowers/glTF-Binary/GlassVaseFlowers.glb', thumb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GlassVaseFlowers/screenshot/screenshot.jpg', poly:22000 },
    { name:'Avocado',          slug:'Avocado',          category:'Food & Organic', tags:['avocado','food','organic','pbr'],          glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb', thumb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/screenshot/screenshot.jpg', poly:1800 },
    { name:'Corset',          slug:'Corset',            category:'Fashion',        tags:['corset','clothing','historical','pbr'],     glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Corset/glTF-Binary/Corset.glb', thumb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Corset/screenshot/screenshot.jpg', poly:18000 },
    { name:'2 Cylinder Engine',slug:'2CylinderEngine',  category:'Mechanical',     tags:['engine','mechanical','industrial','pbr'],  glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/2CylinderEngine/glTF-Binary/2CylinderEngine.glb', thumb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/2CylinderEngine/screenshot/screenshot.jpg', poly:48000 },
    { name:'Gearbox Assy',     slug:'GearboxAssy',      category:'Mechanical',     tags:['gears','mechanical','industrial','pbr'],    glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GearboxAssy/glTF-Binary/GearboxAssy.glb', thumb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GearboxAssy/screenshot/screenshot.jpg', poly:64000 },
    { name:'Reciprocating Saw',slug:'ReciprocatingSaw', category:'Tools',          tags:['saw','tool','mechanical','animated'],      glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ReciprocatingSaw/glTF-Binary/ReciprocatingSaw.glb', thumb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ReciprocatingSaw/screenshot/screenshot.jpg', poly:25000 },
    { name:'Cesium Milk Truck',slug:'CesiumMilkTruck',  category:'Vehicles',       tags:['truck','vehicle','animated','pbr'],        glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb', thumb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CesiumMilkTruck/screenshot/screenshot.jpg', poly:3900 },
    { name:'Dragon Attenuation',slug:'DragonAttenuation',category:'Fantasy',       tags:['dragon','fantasy','translucent','pbr'],      glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DragonAttenuation/glTF-Binary/DragonAttenuation.glb', thumb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DragonAttenuation/screenshot/screenshot.jpg', poly:28000 },
  ];

  const docs = [];
  
  for (const base of MODEL_VIEWER_MODELS) {
    const kbEst = Math.floor(base.poly * 0.5 + r() * 500);
    docs.push({
      source:         'modelviewer',
      slug:           base.slug.toLowerCase(),
      original_slug:  base.slug,
      name:           base.name,
      category:       base.category,
      tags:           base.tags,
      complexity:     base.poly > 30000 ? 'high' : base.poly > 5000 ? 'medium' : 'low',
      complexity_score: base.poly > 30000 ? 3 : base.poly > 5000 ? 2 : 1,
      poly_count:     base.poly,
      file_size_kb:   kbEst,
      file_size_mb:   parseFloat((kbEst / 1024).toFixed(2)),
      year_published: 2018 + Math.floor(r() * 6),
      license:        'CC0',
      author:         'Khronos Group / Model Viewer',
      has_glb:        true,
      glb_url:        base.glb,
      thumbnail_url:  base.thumb,
      download_count: Math.floor(1000 + r() * 20000),
      rating:         parseFloat((3.5 + r() * 1.5).toFixed(1)),
      rating_votes:   Math.floor(20 + r() * 300),
      popularity_tier: base.poly > 30000 ? 'high' : 'medium',
      has_animations: base.tags.includes('animated'),
      has_pbr:        base.tags.includes('pbr'),
      is_rigged:      base.tags.includes('rigged'),
      renderer_tested: ['Three.js', 'Babylon.js', 'Model Viewer'],
      compatible_apps: ['Three.js', 'Babylon.js', 'PlayCanvas', 'A-Frame'],
      description:    `A ${base.poly > 30000 ? 'high' : base.poly > 5000 ? 'medium' : 'low'}-complexity ${base.category.toLowerCase()} 3D model with real GLB file.`,
      sketchfab_url:   null,
      embed_url:      null,
    });
  }

  console.log(`Built ${docs.length} Model Viewer / Khronos 3D records`);
  return docs;
}

async function main() {
  const client = await MongoClient.connect(URI);
  const db = client.db('assetsDB');
  const col = db.collection('models');
  await col.drop().catch(()=>{});
  console.log('Cleared collection\n');

  const docs = [];

  console.log('Building Khronos records (real GLBs with PBR materials)...');
  const VARIANTS = 1;
  for (const base of KHRONOS_MODELS) {
    for (let v = 0; v < VARIANTS; v++) {
      docs.push(buildKhronosDoc(base, v));
    }
  }
  console.log(`${docs.length} Khronos records\n`);

  const phDocs = await fetchPolyHaven();
  docs.push(...phDocs);

  const mvDocs = await fetchModelViewerModels();
  docs.push(...mvDocs);

  const sfDocs = await fetchSketchfabModels();
  docs.push(...sfDocs);

  await col.insertMany(docs, { ordered: false });


  console.log('\nCreating indexes...');
  await col.createIndex({ source: 1 });
  await col.createIndex({ category: 1 });
  await col.createIndex({ tags: 1 });
  await col.createIndex({ complexity: 1 });
  await col.createIndex({ has_glb: 1 });
  await col.createIndex({ download_count: -1 });
  await col.createIndex({ rating: -1 });
  await col.createIndex({ file_size_mb: 1 });
  await col.createIndex({ year_published: 1 });
  await col.createIndex({ popularity_tier: 1 });
  await col.createIndex({ has_animations: 1 });
  await col.createIndex({ name: 'text', tags: 'text' });

  const total = await col.countDocuments();
  const bySource = {
    khronos: await col.countDocuments({ source: 'khronos' }),
    polyhaven: await col.countDocuments({ source: 'polyhaven' }),
    modelviewer: await col.countDocuments({ source: 'modelviewer' }),
    sketchfab: await col.countDocuments({ source: 'sketchfab' }),
  };
  console.log(`\nassetsDB.models → ${total} total documents`);
  Object.entries(bySource).forEach(([k,v]) => console.log(` ${v} from ${k}`));
  await client.close();
}

main().catch(e => { console.error('\n', e.message); process.exit(1); });
