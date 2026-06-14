import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import {
  Modal, FormField, Input, BtnPrimary, BtnIcon,
  PageHeader, ErrorBanner, EmptyState, DataTable, ConfirmDialog, Textarea
} from '../../components/common/ui';
import { useAuth } from '../../context/AuthContext';
import * as patientApi from '../../api/patientApi';
import * as appointmentApi from '../../api/appointmentApi';
import { formatDate } from '../../utils/formatDate';
import { AppointmentBadge } from '../../components/common/ui';

const COLUMNS = ['Nama', 'Tanggal Lahir', 'Alamat', 'Terdaftar', 'Aksi'];
const EMPTY_FORM = { name: '', email: '', password: '', date_of_birth: '', address: '' };

const PatientPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Riwayat appointment pasien
  const [showHistory, setShowHistory] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await patientApi.getAll();
      setPatients(res.data?.data || []);
    } catch (e) {
      setError('Gagal memuat data pasien');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const openCreate = () => {
    setEditId(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (pat) => {
    setEditId(pat.id);
    setFormData({
      name: pat.name,
      email: '',
      password: '',
      date_of_birth: pat.date_of_birth ? pat.date_of_birth.split('T')[0] : '',
      address: pat.address || '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!editId && (!formData.email || !formData.password)) {
      setFormError('Email dan password wajib untuk pasien baru.');
      return;
    }
    setSubmitting(true);
    try {
      if (editId) {
        await patientApi.update(editId, {
          name: formData.name,
          date_of_birth: formData.date_of_birth || null,
          address: formData.address || null,
        });
      } else {
        await patientApi.create(formData);
      }
      setShowForm(false);
      fetchPatients();
    } catch (err) {
      setFormError(err?.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await patientApi.remove(id);
      fetchPatients();
    } catch (err) {
      alert(err?.message || 'Gagal menghapus pasien');
    }
    setConfirmDelete(null);
  };

  const openHistory = async (patient) => {
    setShowHistory(patient);
    setLoadingHistory(true);
    try {
      // Fetch all appointments and filter by patient_id
      const res = await appointmentApi.getAll();
      const all = res.data?.data || [];
      setHistory(all.filter(a => a.patient_id === patient.id));
    } catch { setHistory([]); }
    finally { setLoadingHistory(false); }
  };

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Manajemen Pasien"
        subtitle={`${patients.length} pasien terdaftar`}
        action={
          isAdmin && (
            <BtnPrimary onClick={openCreate}>
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Tambah Pasien
            </BtnPrimary>
          )
        }
      />

      {error && <ErrorBanner message={error} onRetry={fetchPatients} />}

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-steel-secondary text-[20px]">search</span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama atau email..."
          className="input-clinical pl-12" />
      </div>

      {/* Table */}
      <div className="bg-pure-surface rounded-xl whisper-shadow border border-whisper-border overflow-hidden">
        <DataTable columns={COLUMNS} loading={loading} skeletonRows={5}>
          {filtered.length === 0 ? (
            <tr><td colSpan={COLUMNS.length}>
              <EmptyState icon="group" message={search ? 'Pasien tidak ditemukan.' : 'Belum ada pasien terdaftar.'} />
            </td></tr>
          ) : filtered.map(pat => (
            <tr key={pat.id} className="hover:bg-surface-container-low/50 transition-colors">
              <td className="px-6 py-4">
                <button
                  onClick={() => openHistory(pat)}
                  className="flex items-center gap-3 hover:underline text-left group"
                >
                  <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {pat.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-body-md group-hover:text-primary transition-colors">{pat.name}</p>
                    <p className="text-label-sm text-steel-secondary">{pat.email}</p>
                  </div>
                </button>
              </td>
              <td className="px-6 py-4 text-body-md">{pat.date_of_birth ? formatDate(pat.date_of_birth) : '—'}</td>
              <td className="px-6 py-4 text-body-md text-steel-secondary max-w-[200px] truncate">{pat.address || '—'}</td>
              <td className="px-6 py-4 text-body-md text-steel-secondary">{formatDate(pat.created_at)}</td>
              <td className="px-6 py-4">
                <div className="flex gap-1">
                  <BtnIcon icon="history" title="Riwayat Janji" onClick={() => openHistory(pat)} />
                  {isAdmin && (
                    <>
                      <BtnIcon icon="edit" title="Edit" onClick={() => openEdit(pat)} />
                      <BtnIcon icon="delete" title="Hapus" danger onClick={() => setConfirmDelete(pat)} />
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Data Pasien' : 'Tambah Pasien Baru'} size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && <ErrorBanner message={formError} />}
          <FormField label="Nama Lengkap" required>
            <Input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="John Doe" required />
          </FormField>
          {!editId && (
            <>
              <FormField label="Email" required>
                <Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="pasien@email.com" required />
              </FormField>
              <FormField label="Password" required>
                <Input type="password" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min. 6 karakter" required minLength={6} />
              </FormField>
            </>
          )}
          <FormField label="Tanggal Lahir">
            <Input type="date" value={formData.date_of_birth} onChange={e => setFormData(p => ({ ...p, date_of_birth: e.target.value }))} />
          </FormField>
          <FormField label="Alamat">
            <Textarea value={formData.address} rows={2}
              onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
              placeholder="Jl. Contoh No. 1, Jakarta" />
          </FormField>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-6 py-2.5 border border-whisper-border rounded-xl text-label-md">Batal</button>
            <BtnPrimary type="submit" loading={submitting}>
              {editId ? 'Simpan Perubahan' : 'Tambah Pasien'}
            </BtnPrimary>
          </div>
        </form>
      </Modal>

      {/* Riwayat Appointment Modal */}
      <Modal open={!!showHistory} onClose={() => setShowHistory(null)} title={`Riwayat Janji — ${showHistory?.name}`} size="lg">
        {loadingHistory ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-surface-container animate-pulse rounded-xl" />)}
          </div>
        ) : history.length === 0 ? (
          <EmptyState icon="calendar_today" message="Pasien ini belum memiliki riwayat janji temu." />
        ) : (
          <div className="space-y-3">
            {history.map(appt => (
              <Link key={appt.id} to={`/appointments/${appt.id}`} onClick={() => setShowHistory(null)}
                className="flex items-center justify-between p-4 bg-canvas-white rounded-xl border border-whisper-border hover:bg-surface-container-low transition-colors">
                <div>
                  <p className="text-label-md font-bold">{appt.doctor_name}</p>
                  <p className="text-label-sm text-steel-secondary">{formatDate(appt.schedule_date)}</p>
                </div>
                <AppointmentBadge status={appt.status} />
              </Link>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete?.id)}
        title="Hapus Pasien"
        message={`Yakin ingin menghapus "${confirmDelete?.name}"? Semua data terkait (appointment, rekam medis) akan ikut terhapus.`}
        confirmLabel="Hapus" danger
      />
    </DashboardLayout>
  );
};

export default PatientPage;
