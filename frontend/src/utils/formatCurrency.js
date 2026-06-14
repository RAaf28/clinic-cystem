/**
 * Format angka ke format mata uang Rupiah Indonesia
 * @param {number} amount
 * @returns {string} "Rp 142.500.000"
 */
export const formatRupiah = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default formatRupiah;
