import { LESSONS } from '../data/lessons.js';

let state = {
  current: null,
  done: new Set(),
  results: [],
};

export function getState() {
  return state;
}

export function setCurrent(lesson) {
  state.current = lesson;
}

export function markDone(idx) {
  state.done.add(idx);
}

export function setResults(results) {
  state.results = results;
}

export function isDone(idx) {
  return state.done.has(idx);
}

export function getProgress() {
  return {
    done: state.done.size,
    total: LESSONS.length,
    pct: (state.done.size / LESSONS.length) * 100,
  };
}

export function isAllDone() {
  return state.done.size === LESSONS.length;
}