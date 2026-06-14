import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import {
  Modal, FormField, Textarea, BtnPrimary, BtnIcon, BtnDanger,
  AppointmentBadge, PaymentBadge, ErrorBanner, Skeleton, ConfirmDialog, Select
} from '../../components/common/ui';
import { useAuth } from '../../context/AuthContext';
import { useAppointment } from '../../context/AppointmentContext';
import { useMedicalRecord } from '../../context/MedicalRecordContext';
import * as paymentApi from '../../api/paymentApi';
import * as medicineApi from '../../api/medicineApi';
import { formatRupiah } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

const AppointmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedAppointment, fetchAppointmentById, updateAppointmentStatus } = useAppointment();
  const { currentRecord, prescriptions, fetchRecordById, createRecord, fetchPrescriptions, addPrescription, removePrescription } = useMedicalRecord();

  const isAdmin = user?.role === 'Admin';
  const isDokter = user?.role === 'Dokter';

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [error, setError] = useState('');

  // Modals
  const [showMedRecForm, setShowMedRecForm] = useState(false);
  const [showPrescForm, setShowPrescForm] = useState(false);
  const [showConfirmStatus, setShowConfirmStatus] = useState(null);
  const [showConfirmPay, setShowConfirmPay] = useState(false);
  const [showConfirmDelPresc, setShowConfirmDelPresc] = useState(null);

  // Forms
  const [medRecForm, setMedRecForm] = useState({ diagnosis: '', notes: '' });
  const [prescForm, setPrescForm] = useState({ medicine_id: '', quantity: 1, dosage: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const appt = await fetchAppointmentById(id);
        // Try to find medical record (via appointments might not give mr id, use getAll to find)
        try {
          // We'll search for medical record by appointment ID via the appointment data
          // Backend returns appointment data; we need to try fetching mr by appointment_id
          // Since we don't have a direct endpoint, try to get all records and filter
          const { default: mrApi } = await import('../../api/medicalRecordApi');
          const mrRes = await mrApi.getAll();
          const mr = (mrRes.data?.data || []).find(r => r.appointment_id === parseInt(id));
          if (mr) {
            await fetchRecordById(mr.id);
            await fetchPrescriptions(mr.id);
          }
        } catch (_) {}

        // Fetch payment
        try {
          const payRes = await paymentApi.getByAppointment(id);
          setPayment(payRes.data?.data);
        } catch (_) {}

        // Fetch medicines for prescription dropdown
        const medRes = await medicineApi.getAll();
        setMedicines(medRes.data?.data || []);
      } catch (e) {
        setError('Gagal memuat detail janji temu');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleCreateMedRec = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createRecord({ ...medRecForm, appointment_id: parseInt(id) });
      setShowMedRecForm(false);
      // Reload
      window.location.reload();
    } catch (err) {
      alert(err?.message || 'Gagal membuat rekam medis');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addPrescription({ ...prescForm, medical_record_id: currentRecord?.id });
      setShowPrescForm(false);
      setPrescForm({ medicine_id: '', quantity: 1, dosage: '' });
    } catch (err) {
      alert(err?.message || 'Gagal menambah resep');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await updateAppointmentStatus(parseInt(id), status);
      setShowConfirmStatus(null);
      window.location.reload();
    } catch (err) {
      alert(err?.message || 'Gagal mengubah status');
    }
  };

  const handleConfirmPayment = async () => {
    try {
      await paymentApi.updateStatus(payment.id, 'Lunas');
      setPayment(p => ({ ...p, payment_status: 'Lunas' }));
      setShowConfirmPay(false);
    } catch (err) {
      alert(err?.message || 'Gagal konfirmasi pembayaran');
    }
  };

  const appt = selectedAppointment;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link to="/appointments" className="flex items-center gap-2 text-label-md text-steel-secondary hover:text-primary transition-colors w-fit">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali ke Daftar Janji
        </Link>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : !appt ? (
        <p className="text-steel-secondary text-body-md">Data tidak ditemukan.</p>
      ) : (
        <div className="space-y-8 max-w-4xl">
          {/* Appointment Info Card */}
          <div className="bg-pure-surface rounded-2xl whisper-shadow border border-whisper-border p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-label-sm text-steel-secondary uppercase tracking-widest mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  #CL-{String(appt.id).padStart(4, '0')}
                </p>
                <h1 className="text-headline-md" style={{ fontSize: '24px' }}>Detail Janji Temu</h1>
              </div>
              <AppointmentBadge status={appt.status} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <InfoRow label="Pasien" value={appt.patient_name} icon="person" />
              <InfoRow label="Dokter" value={appt.doctor_name} icon="stethoscope" />
              <InfoRow label="Jadwal" value={formatDateTime(appt.schedule_date)} icon="calendar_today" />
              <InfoRow label="Status" value={<AppointmentBadge status={appt.status} />} icon="info" />
            </div>

            {(isAdmin || isDokter) && appt.status === 'Pending' && (
              <div className="flex gap-3 mt-6 pt-6 border-t border-whisper-border">
                <button onClick={() => setShowConfirmStatus('Selesai')}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl text-label-md spring-interaction">
                  Tandai Selesai
                </button>
                <button onClick={() => setShowConfirmStatus('Batal')}
                  className="px-5 py-2.5 bg-error/10 text-error rounded-xl text-label-md spring-interaction">
                  Batalkan Janji
                </button>
              </div>
            )}
          </div>

          {/* Payment Card */}
          {payment && (
            <div className="bg-pure-surface rounded-2xl whisper-shadow border border-whisper-border p-8">
              <h2 className="text-headline-md mb-5" style={{ fontSize: '18px' }}>Informasi Pembayaran</h2>
              <div className="grid grid-cols-2 gap-6">
                <InfoRow label="Total Tagihan" value={<span className="font-bold text-primary">{formatRupiah(payment.total_amount)}</span>} icon="payments" />
                <InfoRow label="Status" value={<PaymentBadge status={payment.payment_status} />} icon="receipt" />
                {payment.paid_at && <InfoRow label="Dibayar" value={formatDateTime(payment.paid_at)} icon="check_circle" />}
              </div>
              {isAdmin && payment.payment_status === 'Belum Bayar' && (
                <div className="mt-5 pt-5 border-t border-whisper-border">
                  <BtnPrimary onClick={() => setShowConfirmPay(true)}>
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Konfirmasi Lunas
                  </BtnPrimary>
                </div>
              )}
            </div>
          )}

          {/* Medical Record */}
          <div className="bg-pure-surface rounded-2xl whisper-shadow border border-whisper-border p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-headline-md" style={{ fontSize: '18px' }}>Rekam Medis</h2>
              {isDokter && !currentRecord && appt.status !== 'Batal' && (
                <BtnPrimary onClick={() => setShowMedRecForm(true)}>
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Isi Rekam Medis
                </BtnPrimary>
              )}
            </div>

            {!currentRecord ? (
              <p className="text-body-md text-steel-secondary">
                {appt.status === 'Batal' ? 'Janji temu dibatalkan.' : 'Rekam medis belum diisi.'}
              </p>
            ) : (
              <div className="space-y-4">
                <InfoRow label="Diagnosis" value={currentRecord.diagnosis} icon="medical_information" />
                {currentRecord.notes && <InfoRow label="Catatan" value={currentRecord.notes} icon="notes" />}

                {/* Prescriptions */}
                <div className="mt-6 pt-6 border-t border-whisper-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-label-md font-bold uppercase tracking-widest text-steel-secondary">Resep Obat</h3>
                    {isDokter && (
                      <button onClick={() => setShowPrescForm(true)}
                        className="flex items-center gap-1 text-label-md text-primary hover:underline">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Tambah Resep
                      </button>
                    )}
                  </div>
                  {prescriptions.length === 0 ? (
                    <p className="text-body-md text-steel-secondary">Belum ada resep obat.</p>
                  ) : (
                    <div className="space-y-3">
                      {prescriptions.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-canvas-white rounded-xl border border-whisper-border">
                          <div>
                            <p className="text-label-md font-bold">{p.medicine_name || `Obat #${p.medicine_id}`}</p>
                            <p className="text-label-sm text-steel-secondary">
                              Qty: {p.quantity} · Dosis: {p.dosage || '—'}
                            </p>
                          </div>
                          {(isAdmin || isDokter) && (
                            <BtnIcon icon="delete" danger title="Hapus resep"
                              onClick={() => setShowConfirmDelPresc({ id: p.id, mrId: currentRecord.id })} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Buat Rekam Medis */}
      <Modal open={showMedRecForm} onClose={() => setShowMedRecForm(false)} title="Isi Rekam Medis">
        <form onSubmit={handleCreateMedRec} className="space-y-5">
          <FormField label="Diagnosis" required>
            <Textarea value={medRecForm.diagnosis} rows={3}
              onChange={e => setMedRecForm(p => ({ ...p, diagnosis: e.target.value }))}
              placeholder="Tulis diagnosis..." required />
          </FormField>
          <FormField label="Catatan Tambahan">
            <Textarea value={medRecForm.notes} rows={2}
              onChange={e => setMedRecForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Catatan opsional..." />
          </FormField>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowMedRecForm(false)}
              className="px-6 py-2.5 border border-whisper-border rounded-xl text-label-md">Batal</button>
            <BtnPrimary type="submit" loading={submitting}>Simpan</BtnPrimary>
          </div>
        </form>
      </Modal>

      {/* Modal: Tambah Resep */}
      <Modal open={showPrescForm} onClose={() => setShowPrescForm(false)} title="Tambah Resep Obat">
        <form onSubmit={handleAddPrescription} className="space-y-5">
          <FormField label="Obat" required>
            <Select value={prescForm.medicine_id} onChange={e => setPrescForm(p => ({ ...p, medicine_id: e.target.value }))} required>
              <option value="">-- Pilih Obat --</option>
              {medicines.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (Stok: {m.stock}) — {formatRupiah(m.price)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Jumlah" required>
            <input type="number" min={1} value={prescForm.quantity}
              onChange={e => setPrescForm(p => ({ ...p, quantity: parseInt(e.target.value) }))}
              className="input-clinical" required />
          </FormField>
          <FormField label="Dosis">
            <input type="text" value={prescForm.dosage}
              onChange={e => setPrescForm(p => ({ ...p, dosage: e.target.value }))}
              placeholder="Contoh: 3x sehari sesudah makan"
              className="input-clinical" />
          </FormField>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowPrescForm(false)}
              className="px-6 py-2.5 border border-whisper-border rounded-xl text-label-md">Batal</button>
            <BtnPrimary type="submit" loading={submitting}>Tambah Resep</BtnPrimary>
          </div>
        </form>
      </Modal>

      {/* Confirm status change */}
      <ConfirmDialog
        open={!!showConfirmStatus}
        onClose={() => setShowConfirmStatus(null)}
        onConfirm={() => handleStatusChange(showConfirmStatus)}
        title={`Ubah status menjadi ${showConfirmStatus}`}
        message={`Yakin ingin mengubah status menjadi "${showConfirmStatus}"?`}
        confirmLabel="Ya, Ubah"
        danger={showConfirmStatus === 'Batal'}
      />

      {/* Confirm payment */}
      <ConfirmDialog
        open={showConfirmPay}
        onClose={() => setShowConfirmPay(false)}
        onConfirm={handleConfirmPayment}
        title="Konfirmasi Pembayaran Lunas"
        message={`Tandai pembayaran sebesar ${payment ? formatRupiah(payment.total_amount) : ''} sebagai Lunas?`}
        confirmLabel="Konfirmasi Lunas"
        danger={false}
      />

      {/* Confirm delete prescription */}
      <ConfirmDialog
        open={!!showConfirmDelPresc}
        onClose={() => setShowConfirmDelPresc(null)}
        onConfirm={() => { removePrescription(showConfirmDelPresc.id, showConfirmDelPresc.mrId); setShowConfirmDelPresc(null); }}
        title="Hapus Resep"
        message="Yakin ingin menghapus resep ini? Stok obat akan dikembalikan."
        confirmLabel="Hapus"
        danger
      />
    </DashboardLayout>
  );
};

const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    <span className="material-symbols-outlined text-primary-container text-[20px] mt-0.5">{icon}</span>
    <div>
      <p className="text-label-sm text-steel-secondary uppercase tracking-wider mb-0.5">{label}</p>
      <div className="text-body-md font-medium">{value}</div>
    </div>
  </div>
);

export default AppointmentDetailPage;
