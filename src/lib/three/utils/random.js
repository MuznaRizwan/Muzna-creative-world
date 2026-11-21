/**
 * Small seeded random generator (mulberry32) so scattered vegetation is the
 * same on every load.
 * @param {number} seed
 */
export function createRandom(seed) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    /** @param {number} min @param {number} max */
    range: (min, max) => min + (max - min) * next(),
    /** @template T @param {readonly T[]} list @returns {T} */
    pick: (list) => list[Math.floor(next() * list.length)],
  };
}
