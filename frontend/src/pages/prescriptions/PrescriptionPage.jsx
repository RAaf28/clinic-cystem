import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import {
  Modal, FormField, BtnPrimary, BtnIcon, Select,
  PageHeader, ErrorBanner, EmptyState, DataTable, ConfirmDialog
} from '../../components/common/ui';
import { useAuth } from '../../context/AuthContext';
import * as prescriptionApi from '../../api/prescriptionApi';
import * as medicalRecordApi from '../../api/medicalRecordApi';
import * as medicineApi from '../../api/medicineApi';
import { formatRupiah } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const COLUMNS = ['Rekam Medis', 'Obat', 'Qty', 'Dosis', 'Harga Satuan', 'Total Harga', 'Aksi'];

const PrescriptionPage = () => {
  const { user } = useAuth();
  const isDokter = user?.role === 'Dokter';
  const isAdmin = user?.role === 'Admin';

  const [records, setRecords] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedRecord, setSelectedRecord] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ medicine_id: '', quantity: 1, dosage: '', medical_record_id: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const fetchInit = useCallback(async () => {
    setLoading(true);
    try {
      const [mrRes, medRes] = await Promise.all([
        medicalRecordApi.getAll(),
        medicineApi.getAll(),
      ]);
      setRecords(mrRes.data?.data || []);
      setMedicines(medRes.data?.data || []);
    } catch { setError('Gagal memuat data'); }
    finally { setLoading(false); }
  }, []);

  const fetchPrescriptions = useCallback(async (mrId) => {
    if (!mrId) { setPrescriptions([]); return; }
    setLoading(true);
    try {
      const res = await prescriptionApi.getByMedicalRecord(mrId);
      setPrescriptions(res.data?.data || []);
    } catch { setPrescriptions([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchInit(); }, [fetchInit]);
  useEffect(() => { fetchPrescriptions(selectedRecord); }, [selectedRecord, fetchPrescriptions]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.medicine_id || !formData.medical_record_id) {
      setFormError('Rekam medis dan obat wajib dipilih.');
      return;
    }
    setSubmitting(true);
    try {
      await prescriptionApi.create(formData);
      setShowForm(false);
      setFormData({ medicine_id: '', quantity: 1, dosage: '', medical_record_id: '' });
      fetchPrescriptions(selectedRecord || formData.medical_record_id);
    } catch (err) {
      setFormError(err?.message || 'Gagal menambah resep');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await prescriptionApi.remove(id);
      fetchPrescriptions(selectedRecord);
    } catch (err) {
      alert(err?.message || 'Gagal menghapus resep');
    }
    setConfirmDel(null);
  };

  const selectedMed = medicines.find(m => String(m.id) === String(formData.medicine_id));

  return (
    <DashboardLayout>
      <PageHeader
        title="Manajemen Resep"
        subtitle="Kelola resep obat berdasarkan rekam medis"
        action={
          isDokter && (
            <BtnPrimary onClick={() => setShowForm(true)}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah Resep
            </BtnPrimary>
          )
        }
      />

      {error && <ErrorBanner message={error} onRetry={fetchInit} />}

      {/* Filter by Medical Record */}
      <div className="mb-6 max-w-sm">
        <label className="text-label-sm text-steel-secondary uppercase tracking-widest mb-2 block">
          Filter per Rekam Medis
        </label>
        <Select value={selectedRecord} onChange={e => setSelectedRecord(e.target.value)}>
          <option value="">— Tampilkan Semua —</option>
          {records.map(r => (
            <option key={r.id} value={r.id}>
              #{String(r.id).padStart(4, '0')} — {r.patient_name || `Appointment #${r.appointment_id}`}
            </option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <div className="bg-pure-surface rounded-xl whisper-shadow border border-whisper-border overflow-hidden">
        <DataTable columns={COLUMNS} loading={loading} skeletonRows={5}>
          {prescriptions.length === 0 && !loading ? (
            <tr><td colSpan={COLUMNS.length}>
              <EmptyState icon="medication" message={selectedRecord ? 'Tidak ada resep untuk rekam medis ini.' : 'Pilih rekam medis atau tambah resep baru.'} />
            </td></tr>
          ) : (
            <>
              {prescriptions.map(p => (
                <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4 text-steel-secondary" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
                    #MR-{String(p.medical_record_id).padStart(4, '0')}
                  </td>
                  <td className="px-6 py-4 font-bold text-body-md">{p.medicine_name || `Obat #${p.medicine_id}`}</td>
                  <td className="px-6 py-4 text-body-md">{p.quantity}</td>
                  <td className="px-6 py-4 text-body-md text-steel-secondary">{p.dosage || '—'}</td>
                  <td className="px-6 py-4 text-body-md" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {p.medicine_price ? formatRupiah(p.medicine_price) : '—'}
                  </td>
                  <td className="px-6 py-4 text-body-md font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {p.medicine_price ? formatRupiah(p.quantity * p.medicine_price) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {(isAdmin || isDokter) && (
                      <BtnIcon icon="delete" danger title="Hapus resep"
                        onClick={() => setConfirmDel(p)} />
                    )}
                  </td>
                </tr>
              ))}
              {/* Footer Total */}
              {prescriptions.length > 0 && (
                <tr className="bg-surface-container-low border-t-2 border-whisper-border">
                  <td colSpan={5} className="px-6 py-4 text-right font-bold text-body-md">
                    Grand Total
                  </td>
                  <td className="px-6 py-4 font-bold text-primary" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px' }}>
                    {formatRupiah(
                      prescriptions.reduce((sum, p) => 
                        sum + (p.medicine_price ? p.quantity * p.medicine_price : 0), 0
                      )
                    )}
                  </td>
                  <td></td>
                </tr>
              )}
            </>
          )}
        </DataTable>
      </div>

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Tambah Resep Obat" size="md">
        <form onSubmit={handleAdd} className="space-y-5">
          {formError && <ErrorBanner message={formError} />}
          <FormField label="Rekam Medis" required>
            <Select value={formData.medical_record_id}
              onChange={e => setFormData(p => ({ ...p, medical_record_id: e.target.value }))} required>
              <option value="">-- Pilih Rekam Medis --</option>
              {records.map(r => (
                <option key={r.id} value={r.id}>
                  #{String(r.id).padStart(4, '0')} — {r.patient_name || `Appointment #${r.appointment_id}`}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Obat" required>
            <Select value={formData.medicine_id}
              onChange={e => setFormData(p => ({ ...p, medicine_id: e.target.value }))} required>
              <option value="">-- Pilih Obat --</option>
              {medicines.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (Stok: {m.stock}) — {formatRupiah(m.price)}
                </option>
              ))}
            </Select>
          </FormField>
          {selectedMed && (
            <div className="p-3 bg-surface-container rounded-xl text-label-sm text-steel-secondary">
              Stok tersedia: <strong className={selectedMed.stock < 10 ? 'text-error' : 'text-primary'}>{selectedMed.stock}</strong> unit
            </div>
          )}
          <FormField label="Jumlah" required>
            <input type="number" min={1} max={selectedMed?.stock || 999}
              value={formData.quantity}
              onChange={e => setFormData(p => ({ ...p, quantity: parseInt(e.target.value) }))}
              className="input-clinical" required />
          </FormField>
          <FormField label="Dosis / Petunjuk">
            <input type="text" value={formData.dosage}
              onChange={e => setFormData(p => ({ ...p, dosage: e.target.value }))}
              placeholder="Contoh: 2x sehari setelah makan"
              className="input-clinical" />
          </FormField>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-6 py-2.5 border border-whisper-border rounded-xl text-label-md">Batal</button>
            <BtnPrimary type="submit" loading={submitting}>Simpan Resep</BtnPrimary>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={() => handleDelete(confirmDel?.id)}
        title="Hapus Resep"
        message={`Yakin ingin menghapus resep "${confirmDel?.medicine_name}"? Stok obat akan dikembalikan.`}
        confirmLabel="Hapus" danger
      />
    </DashboardLayout>
  );
};

export default PrescriptionPage;
