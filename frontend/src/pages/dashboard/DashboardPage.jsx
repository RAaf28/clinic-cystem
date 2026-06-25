import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/common/DashboardLayout';
import * as appointmentApi from '../../api/appointmentApi';
import * as doctorApi from '../../api/doctorApi';
import * as patientApi from '../../api/patientApi';
import * as paymentApi from '../../api/paymentApi';
import * as medicineApi from '../../api/medicineApi';

const formatRupiah = (amount) => {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const StatusBadge = ({ status }) => {
  const styles = { Pending: 'bg-surface-container text-steel-secondary', Selesai: 'bg-primary/10 text-primary', Batal: 'bg-error/10 text-error' };
  return (
    <span className={`px-3 py-1 rounded-full text-label-sm uppercase tracking-wider ${styles[status] || styles.Pending}`} style={{ fontSize: '10px' }}>
      {status}
    </span>
  );
};

const Skeleton = ({ className = '' }) => <div className={`animate-pulse bg-surface-container rounded-lg ${className}`} />;

const MetricCard = ({ label, value, sub, accent, icon, loading, children, linkTo }) => {
  const content = (
    <div className={`p-8 rounded-xl whisper-shadow flex flex-col justify-between h-52 transition-all hover:scale-[1.01] ${accent ? 'bg-primary-container text-white' : 'bg-pure-surface border border-whisper-border'}`}>
      {loading ? (
        <><div className="space-y-3"><Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-32" /></div><Skeleton className="h-4 w-28" /></>
      ) : (
        <>
          <div>
            <p className={`text-label-sm uppercase tracking-widest mb-2 ${accent ? 'text-white/70' : 'text-steel-secondary'}`}>{label}</p>
            <h3 className={`leading-none ${accent ? 'text-white' : 'text-primary'}`} style={{ fontSize: '40px', fontWeight: 800 }}>{value}</h3>
          </div>
          <div className={`flex items-center justify-between ${accent ? 'text-white/80' : ''}`}>
            <span className="text-label-md">{sub}</span>
            {icon && <span className={`material-symbols-outlined text-4xl ${accent ? 'text-white/40' : 'text-primary/20'}`}>{icon}</span>}
            {children}
          </div>
        </>
      )}
    </div>
  );
  return linkTo ? <Link to={linkTo}>{content}</Link> : content;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [patientCount, setPatientCount] = useState(null);
  const [medicinesLowStock, setMedicinesLowStock] = useState(0);
  const [todayAppointmentCount, setTodayAppointmentCount] = useState(0);
  const [loadingAppt, setLoadingAppt] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setError(null);
    try {
      setLoadingAppt(true);
      const res = await appointmentApi.getAll();
      const all = res.data?.data || [];
      setAppointments(all);
      const today = new Date().toDateString();
      setTodayAppointmentCount(all.filter((a) => new Date(a.schedule_date).toDateString() === today).length);
    } catch (e) { setError('Gagal memuat data appointments'); } finally { setLoadingAppt(false); }

    try {
      setLoadingDoctors(true);
      const res = await doctorApi.getAll();
      setDoctors(res.data?.data || []);
    } catch (e) {} finally { setLoadingDoctors(false); }

    try {
      setLoadingStats(true);
      const res = await paymentApi.getDashboardStats();
      setPaymentStats(res.data?.data || null);
    } catch (e) {} finally { setLoadingStats(false); }

    try {
      const res = await patientApi.getAll();
      setPatientCount((res.data?.data || []).length);
    } catch (e) {}

    try {
      const res = await medicineApi.getAll();
      setMedicinesLowStock((res.data?.data || []).filter((m) => m.stock < 10).length);
    } catch (e) {}
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const filteredAppointments = appointments
    .filter((a) =>
      a.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(a.id).includes(searchQuery)
    )
    .slice(0, 5);

  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;
  const growthPercent = paymentStats && paymentStats.total_transaksi > 0
    ? ((paymentStats.transaksi_bulan_ini / paymentStats.total_transaksi) * 100).toFixed(1)
    : '0.0';

  const handleGenerateReport = async () => {
    setGeneratingPdf(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      const now = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
      const primaryColor = [37, 99, 235];

      // Header
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Clynic — Laporan Dashboard', 14, 13);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Digenerate: ${now}`, 14, 22);
      doc.text(`Admin: ${user?.name || '-'}`, 14, 27);

      // Summary stats
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Ringkasan Klinik', 14, 42);

      autoTable(doc, {
        startY: 46,
        head: [['Metrik', 'Nilai']],
        body: [
          ['Total Pasien', patientCount?.toLocaleString('id-ID') || '—'],
          ['Total Dokter', doctors.length.toString()],
          ['Janji Pending', pendingCount.toString()],
          ['Janji Hari Ini', todayAppointmentCount.toString()],
          ['Total Pendapatan', paymentStats ? formatRupiah(paymentStats.total_pendapatan) : '—'],
          ['Total Transaksi', paymentStats?.total_transaksi?.toLocaleString('id-ID') || '—'],
          ['Transaksi Bulan Ini', paymentStats?.transaksi_bulan_ini?.toLocaleString('id-ID') || '—'],
          ['Porsi Bulan Ini', `${growthPercent}%`],
          ['Obat Stok Menipis', medicinesLowStock.toString()],
        ],
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 255] },
        styles: { fontSize: 10 },
      });

      // Recent appointments table
      const afterStats = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Janji Temu Terbaru (5 terakhir)', 14, afterStats);

      autoTable(doc, {
        startY: afterStats + 4,
        head: [['ID', 'Pasien', 'Dokter', 'Jadwal', 'Status']],
        body: filteredAppointments.map((a) => [
          `#CL-${String(a.id).padStart(4, '0')}`,
          a.patient_name,
          a.doctor_name,
          formatDate(a.schedule_date),
          a.status,
        ]),
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 255] },
        styles: { fontSize: 9 },
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Halaman ${i} dari ${pageCount} — Clynic Medical Suite`, 14, 290);
      }

      const fileName = `laporan-dashboard-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
    } catch (err) {
      alert('Gagal generate PDF. Pastikan jsPDF sudah terinstall.');
      console.error(err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen -m-10">

        {/* ── Top AppBar ─────────────────────────────────────────────────── */}
        <header className="flex justify-between items-center h-18 px-10 py-4 bg-pure-surface border-b border-whisper-border sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <span className="text-headline-md text-primary" style={{ fontSize: '22px' }}>Clinic Administration</span>
            <div className="relative w-80 hidden md:block">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-steel-secondary text-[20px]">search</span>
              <input
                id="dashboard-search" type="text" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pasien, dokter, ID..."
                className="w-full pl-12 pr-4 py-2.5 bg-canvas-white border border-whisper-border rounded-full text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button id="btn-refresh" onClick={fetchDashboardData}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant" title="Refresh data">
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
            <div className="h-7 w-px bg-whisper-border" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-label-md font-bold leading-tight">{user?.name || 'Administrator'}</p>
                <p className="text-steel-secondary uppercase tracking-wider" style={{ fontSize: '10px' }}>{user?.role || 'Admin'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold text-sm border border-whisper-border">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* ── Content Body ────────────────────────────────────────────────── */}
        <main className="flex-1 p-10 space-y-10 max-w-screen-xl mx-auto w-full">

          {error && (
            <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-body-md">
              <span className="material-symbols-outlined">error_outline</span>
              <span>{error}</span>
              <button onClick={fetchDashboardData} className="ml-auto text-label-md font-bold hover:underline">Coba Lagi</button>
            </div>
          )}

          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center animate-fade-in-up">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-full text-primary text-label-sm">
                <span className="w-2 h-2 rounded-full bg-primary-container active-dot-pulse" />
                SYSTEM ACTIVE • BACKEND CONNECTED
              </div>
              <h2 className="text-display-lg tracking-tight leading-tight" style={{ fontSize: '40px' }}>
                Clinical Operations<br /><span className="text-primary-container">Overview</span>
              </h2>
              <p className="text-body-lg text-steel-secondary max-w-md">
                Data real-time dari database klinik. Pantau janji temu, dokter, pasien, dan kinerja keuangan secara langsung.
              </p>
              <div className="flex gap-4 flex-wrap">
                <button
                  id="btn-generate-report"
                  onClick={handleGenerateReport}
                  disabled={generatingPdf}
                  className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl text-label-md spring-interaction hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {generatingPdf ? 'progress_activity' : 'picture_as_pdf'}
                  </span>
                  {generatingPdf ? 'Generating...' : 'Generate Report'}
                </button>
                <Link to="/appointments"
                  className="px-8 py-3.5 border border-whisper-border rounded-xl text-label-md hover:bg-surface-container-low spring-interaction transition-colors">
                  Lihat Janji Temu
                </Link>
              </div>
            </div>

            <div className="relative h-72 md:h-80 overflow-hidden rounded-2xl whisper-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary-container/20 to-surface-container" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
                <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                  {[
                    { icon: 'group', label: 'Total Pasien', val: patientCount !== null ? patientCount.toLocaleString('id-ID') : '—' },
                    { icon: 'stethoscope', label: 'Dokter', val: doctors.length || '—' },
                    { icon: 'calendar_today', label: 'Janji Aktif', val: pendingCount || '0' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-pure-surface/80 backdrop-blur rounded-xl p-4 text-center whisper-shadow">
                      <span className="material-symbols-outlined text-primary-container text-2xl">{stat.icon}</span>
                      <p className="text-label-md font-bold mt-1">{stat.val}</p>
                      <p className="text-label-sm text-steel-secondary" style={{ fontSize: '10px' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-pure-surface/80 backdrop-blur rounded-full px-4 py-2 whisper-shadow">
                  <span className="w-2 h-2 bg-primary-container rounded-full active-dot-pulse" />
                  <span className="text-label-sm text-primary">Database Terhubung — Data Live</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Metrics ──────────────────────────────────────────────────── */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="sm:col-span-2 bg-pure-surface p-8 rounded-xl whisper-shadow border border-whisper-border flex flex-col justify-between h-52">
              {loadingStats ? (
                <><div className="space-y-3"><Skeleton className="h-3 w-28" /><Skeleton className="h-12 w-44" /></div><Skeleton className="h-4 w-36" /></>
              ) : (
                <>
                  <div>
                    <p className="text-label-sm text-steel-secondary uppercase tracking-widest mb-2">Total Pendapatan</p>
                    <h3 className="text-primary leading-none" style={{ fontSize: '40px', fontWeight: 800 }}>
                      {paymentStats ? formatRupiah(paymentStats.total_pendapatan) : 'Rp 0'}
                    </h3>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <span className="material-symbols-outlined text-[18px]">trending_up</span>
                      <span className="text-label-md">{paymentStats?.transaksi_bulan_ini || 0} transaksi bulan ini</span>
                    </div>
                    <div className="flex gap-1 items-end h-12">
                      {[40, 60, 55, 80, 70, 90, 100].map((h, i) => (
                        <div key={i} className="w-2 rounded-t-full" style={{ height: `${h}%`, backgroundColor: `rgba(16, 185, 129, ${0.15 + (i / 7) * 0.85})` }} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <MetricCard label="Janji Pending" value={loadingAppt ? '...' : pendingCount} sub="Menunggu konfirmasi" accent icon="calendar_month" loading={loadingAppt} linkTo="/appointments" />

            <div className="bg-pure-surface p-8 rounded-xl whisper-shadow border border-whisper-border h-52 flex flex-col justify-between">
              {loadingStats ? (
                <><div className="space-y-3"><Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-20" /></div><Skeleton className="h-4 w-28" /></>
              ) : (
                <>
                  <div>
                    <p className="text-label-sm text-steel-secondary uppercase tracking-widest mb-2">Total Transaksi</p>
                    <h3 className="leading-none" style={{ fontSize: '36px', fontWeight: 700 }}>{paymentStats?.total_transaksi?.toLocaleString('id-ID') || '0'}</h3>
                  </div>
                  <div className="py-2 border-t border-whisper-border">
                    <span className="text-label-md text-steel-secondary">Semua Pembayaran</span>
                  </div>
                </>
              )}
            </div>

            <div className="sm:col-span-2 bg-pure-surface p-8 rounded-xl whisper-shadow border border-whisper-border h-52 flex flex-col justify-between relative overflow-hidden">
              {loadingStats ? (
                <><div className="space-y-3"><Skeleton className="h-3 w-36" /><Skeleton className="h-12 w-28" /></div><Skeleton className="h-4 w-56" /></>
              ) : (
                <>
                  <div className="z-10">
                    <p className="text-label-sm text-steel-secondary uppercase tracking-widest mb-2">Transaksi Bulan Ini</p>
                    <h3 className="text-primary leading-none" style={{ fontSize: '40px', fontWeight: 800 }}>
                      {paymentStats?.transaksi_bulan_ini || 0}
                      <span className="text-label-md text-steel-secondary ml-3" style={{ fontSize: '14px' }}>/ {paymentStats?.total_transaksi || 0} total</span>
                    </h3>
                  </div>
                  <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined text-primary absolute -bottom-10 -right-10" style={{ fontSize: '200px', lineHeight: 1 }}>show_chart</span>
                  </div>
                  <div className="z-10">
                    <p className="text-body-md text-steel-secondary">{growthPercent}% dari total transaksi keseluruhan terjadi bulan ini.</p>
                  </div>
                </>
              )}
            </div>

            <MetricCard label="Janji Hari Ini" value={loadingAppt ? '...' : todayAppointmentCount} sub="Jadwal Hari Ini" icon="personal_injury" loading={loadingAppt} linkTo="/appointments" />

            <div className={`p-8 rounded-xl h-52 flex flex-col justify-between ${medicinesLowStock > 0 ? 'bg-error/5 border border-error/20' : 'bg-pure-surface border border-whisper-border whisper-shadow'}`}>
              <div>
                <p className={`text-label-sm uppercase tracking-widest mb-2 ${medicinesLowStock > 0 ? 'text-error/80' : 'text-steel-secondary'}`}>Stok Obat Menipis</p>
                <h3 className={`leading-none ${medicinesLowStock > 0 ? 'text-error' : 'text-primary'}`} style={{ fontSize: '36px', fontWeight: 700 }}>{medicinesLowStock}</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-label-md ${medicinesLowStock > 0 ? 'text-error/70' : 'text-steel-secondary'}`}>{medicinesLowStock > 0 ? 'Perlu restock segera' : 'Stok aman'}</span>
                <Link to="/medicines" className={`text-label-sm font-bold hover:underline ${medicinesLowStock > 0 ? 'text-error' : 'text-primary'}`}>Kelola →</Link>
              </div>
            </div>
          </section>

          {/* ── Table + Right Panel ───────────────────────────────────────── */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-pure-surface rounded-xl whisper-shadow border border-whisper-border overflow-hidden">
              <div className="p-7 border-b border-whisper-border flex justify-between items-center">
                <div>
                  <h4 className="text-headline-md" style={{ fontSize: '20px' }}>Janji Temu Terbaru</h4>
                  {!loadingAppt && <p className="text-label-sm text-steel-secondary mt-0.5">{appointments.length} total · {pendingCount} pending</p>}
                </div>
                <Link to="/appointments" className="text-primary text-label-md flex items-center gap-1 hover:gap-2 transition-all">
                  Lihat Semua <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
              <div className="overflow-x-auto">
                {loadingAppt ? (
                  <div className="p-7 space-y-4">{[1,2,3,4].map((i) => <div key={i} className="flex gap-6"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-16" /></div>)}</div>
                ) : (
                  <table className="w-full text-left" id="table-recent-appointments">
                    <thead className="bg-surface-container-low border-b border-whisper-border">
                      <tr>{['ID','Pasien','Dokter','Jadwal','Status'].map((h) => <th key={h} className="px-7 py-4 text-label-sm text-steel-secondary uppercase tracking-widest">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-whisper-border">
                      {filteredAppointments.length === 0 ? (
                        <tr><td colSpan={5} className="px-7 py-12 text-center text-steel-secondary text-body-md">
                          <span className="material-symbols-outlined text-4xl block mb-2 text-outline-variant">calendar_today</span>
                          {searchQuery ? 'Tidak ada hasil pencarian.' : 'Belum ada data janji temu.'}
                        </td></tr>
                      ) : filteredAppointments.map((appt) => (
                        <tr key={appt.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-7 py-5 text-steel-secondary" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>#CL-{String(appt.id).padStart(4, '0')}</td>
                          <td className="px-7 py-5 font-bold text-body-md">{appt.patient_name}</td>
                          <td className="px-7 py-5 text-body-md text-on-surface-variant">{appt.doctor_name}</td>
                          <td className="px-7 py-5 text-body-md text-on-surface-variant">{formatDate(appt.schedule_date)}</td>
                          <td className="px-7 py-5"><StatusBadge status={appt.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-pure-surface p-7 rounded-xl whisper-shadow border border-whisper-border">
                <h4 className="text-headline-md mb-6" style={{ fontSize: '18px' }}>Dokter Terdaftar</h4>
                {loadingDoctors ? (
                  <div className="space-y-5">{[1,2,3].map((i) => <div key={i} className="flex items-center gap-3"><Skeleton className="w-11 h-11 rounded-full flex-shrink-0" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-24" /></div></div>)}</div>
                ) : doctors.length === 0 ? (
                  <p className="text-body-md text-steel-secondary text-center py-4">Belum ada dokter terdaftar.</p>
                ) : (
                  <div className="space-y-5">
                    {doctors.slice(0, 4).map((doc) => {
                      const today = new Date().toDateString();
                      const hasActiveAppt = appointments.some((a) => a.doctor_id === doc.id && a.status === 'Pending' && new Date(a.schedule_date).toDateString() === today);
                      return (
                        <div key={doc.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center text-sm font-bold text-primary">
                                {doc.name?.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                              </div>
                              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${hasActiveAppt ? 'bg-primary-container active-dot-pulse' : 'bg-outline-variant'}`} />
                            </div>
                            <div>
                              <p className="text-label-md font-bold">{doc.name}</p>
                              <p className="text-label-sm text-steel-secondary">{doc.department_name}</p>
                            </div>
                          </div>
                          <span className={`font-bold uppercase tracking-widest ${hasActiveAppt ? 'text-primary' : 'text-steel-secondary'}`} style={{ fontSize: '10px' }}>
                            {hasActiveAppt ? 'Aktif' : 'Standby'}
                          </span>
                        </div>
                      );
                    })}
                    {doctors.length > 4 && <p className="text-label-sm text-steel-secondary text-center pt-1">+{doctors.length - 4} dokter lainnya</p>}
                  </div>
                )}
                <Link to="/doctors" id="link-view-all-doctors"
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3 border border-whisper-border rounded-xl text-label-md hover:bg-surface-container-low transition-colors">
                  Semua Dokter <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>

              <div className="bg-inverse-surface p-7 rounded-xl whisper-shadow flex items-center justify-between overflow-hidden relative">
                <div className="z-10">
                  <p className="text-label-sm opacity-60 uppercase tracking-widest mb-1">System Status</p>
                  <p className="text-headline-md" style={{ fontSize: '22px', color: '#ebf3eb' }}>{error ? 'Error' : 'Optimal'}</p>
                  <p className="text-body-md mt-1 opacity-70" style={{ color: '#ebf3eb' }}>{error ? 'Koneksi bermasalah' : 'Database Terhubung'}</p>
                </div>
                <div className="z-10">
                  <span className="material-symbols-outlined text-4xl" style={{ color: error ? '#fc7c78' : '#4edea3', animation: 'clinical-spin 3s linear infinite' }}>
                    {error ? 'error' : 'refresh'}
                  </span>
                </div>
                <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
              </div>

              <div className="bg-pure-surface p-7 rounded-xl whisper-shadow border border-whisper-border">
                <h4 className="text-label-md text-steel-secondary uppercase tracking-widest mb-4">Aksi Cepat</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: 'person_add', label: 'Tambah Pasien', to: '/patients' },
                    { icon: 'event_available', label: 'Buat Janji', to: '/appointments' },
                    { icon: 'medication', label: 'Cek Obat', to: '/medicines' },
                    { icon: 'payments', label: 'Pembayaran', to: '/payments' },
                  ].map((action) => (
                    <Link key={action.label} to={action.to}
                      className="flex flex-col items-center gap-2 p-4 bg-canvas-white rounded-xl hover:bg-surface-container-low transition-colors spring-interaction border border-whisper-border text-center">
                      <span className="material-symbols-outlined text-primary-container text-2xl">{action.icon}</span>
                      <span className="text-label-sm text-on-surface-variant" style={{ fontSize: '11px' }}>{action.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;