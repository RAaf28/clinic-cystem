const NodeCache = require("node-cache");
/**
 * Instance node-cache untuk in-memory caching
 * stdTTL: 300 detik (5 menit) default TTL
 * checkperiod: 60 detik interval pengecekan expired keys
 */
const cache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
});
/**
 * Helper: ambil dari cache, jika miss panggil fetchFn lalu simpan
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Async function untuk fetch data jika cache miss
 * @param {number} [ttl] - TTL khusus (opsional, default pakai stdTTL)
 * @returns {Promise<*>} Data dari cache atau hasil fetchFn
 */
const getOrSet = async (key, fetchFn, ttl) => {
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const data = await fetchFn();
  if (ttl) {
    cache.set(key, data, ttl);
  } else {
    cache.set(key, data);
  }
  return data;
};
module.exports = { cache, getOrSet };
