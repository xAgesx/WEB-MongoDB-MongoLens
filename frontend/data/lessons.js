export const LESSONS = [
  {name:'Browse all models',       icon:'🗂️',tag:'FIND',tc:'tf',
   desc:'The simplest MongoDB read. An empty filter {} matches every document in the collection. limit(12) caps results.',
   cmd:'db.models.find({}).limit(12)',
   op:'find',filter:{},opts:{limit:12}},

  {name:'Filter by source',        icon:'🔎',tag:'FIND',tc:'tf',
   desc:'Exact match on a string field. Filter by "source" to get only Khronos models which have real GLB files.',
   cmd:'db.models.find({ source: "khronos" })',
   op:'find',filter:{source:'khronos'},opts:{limit:12}},

  {name:'Filter by category',      icon:'🏷️',tag:'FIND',tc:'tf',
   desc:'Exact match on the category field. Find models in the Vehicles category.',
   cmd:'db.models.find({ category: "Vehicles" })',
   op:'find',filter:{category:'Vehicles'},opts:{limit:12}},

  {name:'Boolean: has GLB',        icon:'📦',tag:'FIND',tc:'tf',
   desc:'Query a boolean field. has_glb:true returns only records with a self-contained 3D model file.',
   cmd:'db.models.find({ has_glb: true })',
   op:'find',filter:{has_glb:true},opts:{limit:12}},

  {name:'Range: file size',        icon:'📐',tag:'FIND',tc:'tf',
   desc:'$gte and $lte on a numeric field. Find models between 1 MB and 10 MB — ideal for web delivery.',
   cmd:'db.models.find({\n  file_size_mb: { $gte: 1, $lte: 10 }\n})',
   op:'find',filter:{file_size_mb:{$gte:1,$lte:10}},opts:{limit:12}},

  {name:'Regex: name search',      icon:'🔍',tag:'REGEX',tc:'tr',
   desc:'$regex enables pattern matching on strings. $options:"i" makes it case-insensitive.',
   cmd:'db.models.find({\n  name: { $regex: "helmet", $options: "i" }\n})',
   op:'find',filter:{name:{$regex:'helmet',$options:'i'}},opts:{limit:12}},

  {name:'Array field: tags',       icon:'🏷️',tag:'FIND',tc:'tf',
   desc:'MongoDB searches inside arrays natively. "pbr" is an element of the tags array.',
   cmd:'db.models.find({ tags: "pbr" })',
   op:'find',filter:{tags:'pbr'},opts:{limit:12}},

  {name:'$in: multiple categories',icon:'🎯',tag:'IN',tc:'ti',
   desc:'$in matches if the field equals any value in the array — equivalent to SQL\'s WHERE x IN (...).',
   cmd:'db.models.find({\n  category: { $in: ["Wearable","Fashion","Characters"] }\n})',
   op:'find',filter:{category:{$in:['Wearable','Fashion','Characters']}},opts:{limit:12}},

  {name:'$ne: exclude Primitives',  icon:'⭐',tag:'FIND',tc:'tf',
   desc:'$ne (not equal) excludes documents matching a value. Return every model that is not a basic primitive.',
   cmd:'db.models.find({\n  category: { $ne: "Primitives" }\n})',
   op:'find',filter:{category:{$ne:'Primitives'}},opts:{limit:12}},

  {name:'Sort: most downloaded',   icon:'🏆',tag:'SORT',tc:'ts',
   desc:'Chain .sort() and .limit() for top-N queries. -1 = descending. Top 10 most-downloaded models.',
   cmd:'db.models.find({})\n  .sort({ download_count: -1 })\n  .limit(10)',
   op:'find',filter:{},opts:{limit:10,sort:{download_count:-1}}},

  {name:'Count by category',       icon:'📊',tag:'AGGR',tc:'ta',
   desc:'$group with $sum:1 counts documents per unique category value — equivalent to SQL GROUP BY + COUNT(*).',
   cmd:'db.models.aggregate([\n  { $group: {\n      _id: "$category",\n      count: { $sum: 1 }\n  }},\n  { $sort: { count: -1 } }\n])',
   op:'aggregate',
   filter:[{$group:{_id:'$category',count:{$sum:1}}},{$sort:{count:-1}}]},

  {name:'Avg size by complexity',  icon:'📉',tag:'AGGR',tc:'ta',
   desc:'Full pipeline: group by complexity, compute average file size and total downloads, sort by total downloads.',
   cmd:'db.models.aggregate([\n  { $group: {\n      _id: "$complexity",\n      avgSizeMB: { $avg: "$file_size_mb" },\n      totalDownloads: { $sum: "$download_count" },\n      count: { $sum: 1 }\n  }},\n  { $sort: { totalDownloads: -1 } }\n])',
   op:'aggregate',
   filter:[{$group:{_id:'$complexity',avgSizeMB:{$avg:'$file_size_mb'},totalDownloads:{$sum:'$download_count'},count:{$sum:1}}},{$sort:{totalDownloads:-1}}]},
];

export const TAG_COLORS = {
  FIND:  { dark: ['#0d1f0d','#5a9e6e'], light: ['#eaf4ee','#1a6a38'] },
  REGEX: { dark: ['#1f1800','#c89a40'], light: ['#fdf6e0','#8a6010'] },
  AGGR:  { dark: ['#0d1525','#6a98c8'], light: ['#eaf0fa','#204880'] },
  NESTED:{ dark: ['#180d25','#9878c8'], light: ['#f4eafa','#501880'] },
  SORT:  { dark: ['#1f0d0d','#c86868'], light: ['#faeeee','#8a2020'] },
  IN:    { dark: ['#1a1200','#c8a040'], light: ['#fdf8e8','#8a6000'] },
};