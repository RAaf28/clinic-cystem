/**
 * Format tanggal ke format Indonesia panjang
 * @param {string|Date} dateStr
 * @returns {string} "25 Januari 2025"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
};

/**
 * Format tanggal + waktu ke format Indonesia
 * @param {string|Date} dateStr
 * @returns {string} "25 Jan 2025, 14:30"
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

/**
 * Format tanggal pendek
 * @param {string|Date} dateStr
 * @returns {string} "25 Jan 2025"
 */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
};

export default formatDate;
