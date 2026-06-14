import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import {
  Modal, FormField, Textarea, BtnPrimary, BtnIcon, Select,
  PageHeader, ErrorBanner, EmptyState, DataTable, ConfirmDialog
} from '../../components/common/ui';
import { useAuth } from '../../context/AuthContext';
import { useMedicalRecord } from '../../context/MedicalRecordContext';
import * as medicalRecordApi from '../../api/medicalRecordApi';
import * as prescriptionApi from '../../api/prescriptionApi';
import * as medicineApi from '../../api/medicineApi';
import { formatRupiah } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const MedicalRecordPage = () => {
  const { user } = useAuth();
  const { records, isLoading, error, fetchRecords } = useMedicalRecord();
  const isDokter = user?.role === 'Dokter';
  const isAdmin = user?.role === 'Admin';

  const [selected, setSelected] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loadingPresc, setLoadingPresc] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [showPrescForm, setShowPrescForm] = useState(false);
  const [showConfirmDel, setShowConfirmDel] = useState(null);

  const [editForm, setEditForm] = useState({ diagnosis: '', notes: '' });
  const [prescForm, setPrescForm] = useState({ medicine_id: '', quantity: 1, dosage: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecords();
    medicineApi.getAll().then(r => setMedicines(r.data?.data || [])).catch(() => {});
  }, [fetchRecords]);

  const loadPrescriptions = useCallback(async (mrId) => {
    setLoadingPresc(true);
    try {
      const res = await prescriptionApi.getByMedicalRecord(mrId);
      setPrescriptions(res.data?.data || []);
    } catch { setPrescriptions([]); }
    finally { setLoadingPresc(false); }
  }, []);

  const handleSelectRecord = (rec) => {
    setSelected(rec);
    loadPrescriptions(rec.id);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await medicalRecordApi.update(selected.id, editForm);
      setShowEdit(false);
      fetchRecords();
    } catch (err) {
      alert(err?.message || 'Gagal mengupdate rekam medis');
    } finally { setSubmitting(false); }
  };

  const handleAddPresc = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await prescriptionApi.create({ ...prescForm, medical_record_id: selected.id });
      setShowPrescForm(false);
      setPrescForm({ medicine_id: '', quantity: 1, dosage: '' });
      loadPrescriptions(selected.id);
    } catch (err) {
      alert(err?.message || 'Gagal menambah resep');
    } finally { setSubmitting(false); }
  };

  const handleDelPresc = async (prescId) => {
    try {
      await prescriptionApi.remove(prescId);
      loadPrescriptions(selected.id);
    } catch (err) {
      alert(err?.message || 'Gagal menghapus resep');
    }
    setShowConfirmDel(null);
  };

  const COLUMNS = ['ID', 'Pasien', 'Diagnosis', 'Tanggal', 'Aksi'];

  return (
    <DashboardLayout>
      <PageHeader
        title="Rekam Medis"
        subtitle={`${records.length} rekam medis tersedia`}
      />

      {error && <ErrorBanner message={error} onRetry={fetchRecords} />}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Table */}
        <div className="xl:col-span-3 bg-pure-surface rounded-xl whisper-shadow border border-whisper-border overflow-hidden">
          <DataTable columns={COLUMNS} loading={isLoading} skeletonRows={5}>
            {records.length === 0 ? (
              <tr><td colSpan={COLUMNS.length}>
                <EmptyState icon="folder_open" message="Belum ada rekam medis." />
              </td></tr>
            ) : records.map(rec => (
              <tr key={rec.id}
                className={`hover:bg-surface-container-low/50 transition-colors cursor-pointer ${selected?.id === rec.id ? 'bg-surface-container-low' : ''}`}
                onClick={() => handleSelectRecord(rec)}
              >
                <td className="px-6 py-4 text-steel-secondary" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
                  #MR-{String(rec.id).padStart(4, '0')}
                </td>
                <td className="px-6 py-4 font-bold text-body-md">{rec.patient_name || `Pasien #${rec.appointment_id}`}</td>
                <td className="px-6 py-4 text-body-md text-on-surface-variant max-w-[200px] truncate">{rec.diagnosis}</td>
                <td className="px-6 py-4 text-body-md">{formatDate(rec.created_at)}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {isDokter && (
                      <BtnIcon icon="edit" title="Edit"
                        onClick={e => { e.stopPropagation(); setEditForm({ diagnosis: rec.diagnosis, notes: rec.notes || '' }); setSelected(rec); setShowEdit(true); }} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        </div>

        {/* Detail panel */}
        <div className="xl:col-span-2">
          {!selected ? (
            <div className="bg-pure-surface rounded-xl whisper-shadow border border-whisper-border p-8 h-full flex items-center justify-center">
              <EmptyState icon="info" message="Pilih rekam medis untuk melihat detail." />
            </div>
          ) : (
            <div className="bg-pure-surface rounded-xl whisper-shadow border border-whisper-border overflow-hidden">
              <div className="px-6 py-5 border-b border-whisper-border bg-surface-container-low">
                <p className="text-label-sm text-steel-secondary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  #MR-{String(selected.id).padStart(4, '0')}
                </p>
                <h3 className="text-headline-md mt-0.5" style={{ fontSize: '18px' }}>{selected.patient_name || 'Detail Rekam Medis'}</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-label-sm text-steel-secondary uppercase tracking-widest mb-1">Diagnosis</p>
                  <p className="text-body-md">{selected.diagnosis}</p>
                </div>
                {selected.notes && (
                  <div>
                    <p className="text-label-sm text-steel-secondary uppercase tracking-widest mb-1">Catatan</p>
                    <p className="text-body-md">{selected.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-label-sm text-steel-secondary uppercase tracking-widest mb-1">Tanggal</p>
                  <p className="text-body-md">{formatDate(selected.created_at)}</p>
                </div>

                {/* Prescriptions */}
                <div className="pt-4 border-t border-whisper-border">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-label-md font-bold uppercase tracking-widest text-steel-secondary" style={{ fontSize: '11px' }}>
                      Resep Obat ({prescriptions.length})
                    </p>
                    {isDokter && (
                      <button onClick={() => setShowPrescForm(true)}
                        className="flex items-center gap-1 text-label-md text-primary hover:underline text-[12px]">
                        <span className="material-symbols-outlined text-[14px]">add</span> Tambah
                      </button>
                    )}
                  </div>
                  {loadingPresc ? (
                    <div className="space-y-2">
                      {[1, 2].map(i => <div key={i} className="h-12 bg-surface-container animate-pulse rounded-lg" />)}
                    </div>
                  ) : prescriptions.length === 0 ? (
                    <p className="text-body-md text-steel-secondary text-sm">Belum ada resep.</p>
                  ) : (
                    <div className="space-y-2">
                      {prescriptions.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-canvas-white rounded-lg border border-whisper-border">
                          <div>
                            <p className="text-label-md font-bold text-sm">{p.medicine_name || `Obat #${p.medicine_id}`}</p>
                            <p className="text-label-sm text-steel-secondary" style={{ fontSize: '11px' }}>
                              {p.quantity}x · {p.dosage || '—'} · {formatRupiah(p.subtotal)}
                            </p>
                          </div>
                          {(isAdmin || isDokter) && (
                            <BtnIcon icon="delete" danger onClick={() => setShowConfirmDel(p.id)} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Edit Rekam Medis */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Rekam Medis">
        <form onSubmit={handleUpdate} className="space-y-5">
          <FormField label="Diagnosis" required>
            <Textarea value={editForm.diagnosis} rows={3}
              onChange={e => setEditForm(p => ({ ...p, diagnosis: e.target.value }))} required />
          </FormField>
          <FormField label="Catatan">
            <Textarea value={editForm.notes} rows={2}
              onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} />
          </FormField>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowEdit(false)}
              className="px-6 py-2.5 border border-whisper-border rounded-xl text-label-md">Batal</button>
            <BtnPrimary type="submit" loading={submitting}>Simpan Perubahan</BtnPrimary>
          </div>
        </form>
      </Modal>

      {/* Modal: Tambah Resep */}
      <Modal open={showPrescForm} onClose={() => setShowPrescForm(false)} title="Tambah Resep Obat">
        <form onSubmit={handleAddPresc} className="space-y-5">
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
            <BtnPrimary type="submit" loading={submitting}>Tambah</BtnPrimary>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!showConfirmDel}
        onClose={() => setShowConfirmDel(null)}
        onConfirm={() => handleDelPresc(showConfirmDel)}
        title="Hapus Resep"
        message="Yakin ingin menghapus resep ini? Stok obat akan dikembalikan."
        confirmLabel="Hapus" danger
      />
    </DashboardLayout>
  );
};

export default MedicalRecordPage;
