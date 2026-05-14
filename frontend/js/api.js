const API = 'http://localhost:3001';

async function request(operation, filter, options = {}) {
  const res = await fetch(`${API}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation, filter, options }),
  });
  const data = await res.json();
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
  const findMatch = raw.match(/db\.models\.find\((.+?)\)(?:\.sort\((.+?)\))?(?:\.limit\((\d+)\))?$/s);
  const countMatch = raw.match(/db\.models\.countDocuments\((.+?)\)$/s);
  if (findMatch) {
    return {
      operation: 'find',
      filter: eval('(' + findMatch[1] + ')'),
      options: {
        limit: findMatch[3] ? +findMatch[3] : 12,
        sort: findMatch[2] ? eval('(' + findMatch[2] + ')') : undefined,
      },
    };
  }
  if (countMatch) {
    return { operation: 'count', filter: eval('(' + countMatch[1] + ')') };
  }
  return null;
}