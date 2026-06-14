import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import {
  BtnPrimary, BtnIcon, PageHeader, ErrorBanner, EmptyState, DataTable,
  PaymentBadge, ConfirmDialog
} from '../../components/common/ui';
import { useAuth } from '../../context/AuthContext';
import * as paymentApi from '../../api/paymentApi';
import { formatRupiah } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

const COLUMNS = ['ID', 'Pasien', 'Dokter', 'Total Tagihan', 'Status', 'Dibuat', 'Aksi'];

const PaymentPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmLunas, setConfirmLunas] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [payRes, statsRes] = await Promise.all([
        paymentApi.getAll(),
        paymentApi.getDashboardStats(),
      ]);
      setPayments(payRes.data?.data || []);
      setStats(statsRes.data?.data || null);
    } catch (e) {
      setError('Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConfirmLunas = async () => {
    if (!confirmLunas) return;
    setSubmitting(true);
    try {
      await paymentApi.updateStatus(confirmLunas.id, 'Lunas');
      setPayments(prev => prev.map(p =>
        p.id === confirmLunas.id ? { ...p, payment_status: 'Lunas', paid_at: new Date().toISOString() } : p
      ));
      if (stats) {
        setStats(s => ({
          ...s,
          total_pendapatan: s.total_pendapatan + confirmLunas.total_amount,
          transaksi_bulan_ini: s.transaksi_bulan_ini + 1,
        }));
      }
      setConfirmLunas(null);
    } catch (err) {
      alert(err?.message || 'Gagal konfirmasi pembayaran');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = payments.filter(p => !statusFilter || p.payment_status === statusFilter);

  const belumBayarCount = payments.filter(p => p.payment_status === 'Belum Bayar').length;

  return (
    <DashboardLayout>
      <PageHeader
        title="Manajemen Pembayaran"
        subtitle={`${payments.length} transaksi · ${belumBayarCount} belum dibayar`}
        action={
          <button onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 border border-whisper-border rounded-xl text-label-md hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
        }
      />

      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {/* Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          {
            label: 'Total Pendapatan',
            value: stats ? formatRupiah(stats.total_pendapatan) : '—',
            icon: 'payments',
            accent: true,
          },
          {
            label: 'Total Transaksi',
            value: stats?.total_transaksi?.toLocaleString('id-ID') || '—',
            icon: 'receipt_long',
          },
          {
            label: 'Transaksi Bulan Ini',
            value: stats?.transaksi_bulan_ini?.toLocaleString('id-ID') || '—',
            icon: 'calendar_month',
          },
        ].map(card => (
          <div key={card.label}
            className={`p-6 rounded-xl border flex items-center justify-between ${
              card.accent
                ? 'bg-primary text-white border-primary'
                : 'bg-pure-surface whisper-shadow border-whisper-border'
            }`}>
            <div>
              <p className={`text-label-sm uppercase tracking-widest mb-1 ${card.accent ? 'text-white/70' : 'text-steel-secondary'}`}>
                {card.label}
              </p>
              <p className={`font-bold leading-tight ${card.accent ? 'text-white' : 'text-primary'}`} style={{ fontSize: '24px' }}>
                {card.value}
              </p>
            </div>
            <span className={`material-symbols-outlined text-4xl ${card.accent ? 'text-white/30' : 'text-primary/20'}`}>
              {card.icon}
            </span>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-6">
        {['', 'Belum Bayar', 'Lunas'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-label-md transition-colors border ${
              statusFilter === s
                ? 'bg-primary text-white border-primary'
                : 'border-whisper-border hover:bg-surface-container-low'
            }`}>
            {s || 'Semua'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-pure-surface rounded-xl whisper-shadow border border-whisper-border overflow-hidden">
        <DataTable columns={COLUMNS} loading={loading} skeletonRows={5}>
          {filtered.length === 0 ? (
            <tr><td colSpan={COLUMNS.length}>
              <EmptyState icon="receipt" message="Belum ada data pembayaran." />
            </td></tr>
          ) : filtered.map(pay => (
            <tr key={pay.id} className="hover:bg-surface-container-low/50 transition-colors">
              <td className="px-6 py-4 text-steel-secondary" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
                #PAY-{String(pay.id).padStart(4, '0')}
              </td>
              <td className="px-6 py-4 font-bold text-body-md">{pay.patient_name}</td>
              <td className="px-6 py-4 text-body-md text-on-surface-variant">{pay.doctor_name}</td>
              <td className="px-6 py-4 font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px' }}>
                {formatRupiah(pay.total_amount)}
              </td>
              <td className="px-6 py-4"><PaymentBadge status={pay.payment_status} /></td>
              <td className="px-6 py-4 text-body-md text-steel-secondary">{formatDateTime(pay.created_at)}</td>
              <td className="px-6 py-4">
                {isAdmin && pay.payment_status === 'Belum Bayar' && (
                  <button onClick={() => setConfirmLunas(pay)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-label-md spring-interaction hover:bg-on-primary-fixed-variant transition-colors"
                    style={{ fontSize: '12px' }}>
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Konfirmasi Lunas
                  </button>
                )}
                {pay.payment_status === 'Lunas' && (
                  <div className="flex items-center gap-1 text-primary text-label-sm">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    {pay.paid_at ? formatDateTime(pay.paid_at) : 'Lunas'}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      <ConfirmDialog
        open={!!confirmLunas}
        onClose={() => setConfirmLunas(null)}
        onConfirm={handleConfirmLunas}
        title="Konfirmasi Pembayaran Lunas"
        message={`Tandai pembayaran sebesar ${confirmLunas ? formatRupiah(confirmLunas.total_amount) : ''} dari ${confirmLunas?.patient_name} sebagai Lunas?`}
        confirmLabel="Konfirmasi Lunas"
        danger={false}
      />
    </DashboardLayout>
  );
};

export default PaymentPage;
