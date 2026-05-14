const API = 'http://localhost:3001';

async function request(operation, filter, options = {}) {
  console.log('[API] Request - operation:', operation);
  console.log('[API] Request - filter:', JSON.stringify(filter));
  console.log('[API] Request - options:', JSON.stringify(options));
  const res = await fetch(`${API}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation, filter, options }),
  });
  console.log('[API] Response status:', res.status);
  const data = await res.json();
  console.log('[API] Response success:', data.success, '- result count:', data.result ? data.result.length : data.count);
  if (!data.success) throw new Error(data.error);
  return data;
}

export async function queryLesson(operation, filter, options) {
  return request(operation, filter, options);
}

export async function runFind(filter, options) {
  return request('find', filter, options);
}

export async function runAggregate(filter) {
  return request('aggregate', filter);
}

export async function runCount(filter) {
  return request('count', filter);
}

export async function getStats() {
  const res = await fetch(`${API}/api/stats`);
  return res.json();
}

export function parseCustomQuery(raw) {
  console.log('[PARSE] Raw query:', raw);
  const findMatch = raw.match(/db\.models\.find\((.+?)\)(?:\.sort\((.+?)\))?(?:\.limit\((\d+)\))?$/s);
  const countMatch = raw.match(/db\.models\.countDocuments\((.+?)\)$/s);
  console.log('[PARSE] findMatch:', findMatch ? 'yes' : 'no');
  console.log('[PARSE] countMatch:', countMatch ? 'yes' : 'no');
  if (findMatch) {
    console.log('[PARSE] Filter string:', findMatch[1]);
    const filter = eval('(' + findMatch[1] + ')');
    console.log('[PARSE] Parsed filter:', JSON.stringify(filter));
    return {
      operation: 'find',
      filter,
      options: {
        limit: findMatch[3] ? +findMatch[3] : 12,
        sort: findMatch[2] ? eval('(' + findMatch[2] + ')') : undefined,
      },
    };
  }
  if (countMatch) {
    return { operation: 'count', filter: eval('(' + countMatch[1] + ')') };
  }
  console.log('[PARSE] No match - returning null');
  return null;
}