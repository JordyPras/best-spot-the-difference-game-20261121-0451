// A tiny seeded random generator (mulberry32) so decorative scatter
// (grass tufts, stars, petals) is identical on every load of a level.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick `count` items out of `items` with the seeded generator, in order. */
export function seededPick(rng, items, count) {
  const copy = items.slice();
  const out = [];
  while (copy.length > 0 && out.length < count) {
    out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  }
  return out;
}
