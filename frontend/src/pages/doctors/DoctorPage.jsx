import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import {
  Modal, FormField, Input, Select, BtnPrimary, BtnIcon,
  PageHeader, ErrorBanner, EmptyState, DataTable, ConfirmDialog
} from '../../components/common/ui';
import { useAuth } from '../../context/AuthContext';
import * as doctorApi from '../../api/doctorApi';
import * as departmentApi from '../../api/departmentApi';
import { formatDate } from '../../utils/formatDate';

const COLUMNS = ['Nama', 'Departemen', 'No. SIP', 'Terdaftar', 'Aksi'];
const EMPTY_FORM = { name: '', email: '', password: '', department_id: '', license_number: '' };

const DoctorPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, deptRes] = await Promise.all([
        doctorApi.getAll(),
        departmentApi.getAll(),
      ]);
      setDoctors(docRes.data?.data || []);
      setDepartments(deptRes.data?.data || []);
    } catch (e) {
      setError('Gagal memuat data dokter');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditId(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (doc) => {
    setEditId(doc.id);
    setFormData({
      name: doc.name,
      email: '', // tidak diisi ulang untuk keamanan
      password: '',
      department_id: doc.department_id,
      license_number: doc.license_number,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!editId && (!formData.email || !formData.password)) {
      setFormError('Email dan password wajib untuk dokter baru.');
      return;
    }
    setSubmitting(true);
    try {
      if (editId) {
        const payload = {
          name: formData.name,
          department_id: parseInt(formData.department_id),
          license_number: formData.license_number,
        };
        await doctorApi.update(editId, payload);
      } else {
        await doctorApi.create({
          ...formData,
          department_id: parseInt(formData.department_id),
        });
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      setFormError(err?.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await doctorApi.remove(id);
      fetchData();
    } catch (err) {
      alert(err?.message || 'Gagal menghapus dokter');
    }
    setConfirmDelete(null);
  };

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.department_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Manajemen Dokter"
        subtitle={`${doctors.length} dokter terdaftar`}
        action={
          isAdmin && (
            <BtnPrimary onClick={openCreate}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah Dokter
            </BtnPrimary>
          )
        }
      />

      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-steel-secondary text-[20px]">search</span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama atau departemen..."
          className="input-clinical pl-12" />
      </div>

      {/* Table */}
      <div className="bg-pure-surface rounded-xl whisper-shadow border border-whisper-border overflow-hidden">
        <DataTable columns={COLUMNS} loading={loading} skeletonRows={5}>
          {filtered.length === 0 ? (
            <tr><td colSpan={COLUMNS.length}>
              <EmptyState icon="stethoscope" message={search ? 'Dokter tidak ditemukan.' : 'Belum ada dokter terdaftar.'} />
            </td></tr>
          ) : filtered.map(doc => (
            <tr key={doc.id} className="hover:bg-surface-container-low/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {doc.name?.split(' ').slice(0, 2).map(n => n[0]).join('')}
                  </div>
                  <span className="font-bold text-body-md">{doc.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-body-md">
                <span className="px-2.5 py-1 bg-surface-container rounded-full text-label-sm text-on-surface-variant" style={{ fontSize: '12px' }}>
                  {doc.department_name}
                </span>
              </td>
              <td className="px-6 py-4 text-body-md text-steel-secondary" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
                {doc.license_number}
              </td>
              <td className="px-6 py-4 text-body-md text-steel-secondary">{formatDate(doc.created_at)}</td>
              <td className="px-6 py-4">
                {isAdmin && (
                  <div className="flex gap-1">
                    <BtnIcon icon="edit" title="Edit" onClick={() => openEdit(doc)} />
                    <BtnIcon icon="delete" title="Hapus" danger onClick={() => setConfirmDelete(doc)} />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Data Dokter' : 'Tambah Dokter Baru'} size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && <ErrorBanner message={formError} />}
          <FormField label="Nama Lengkap" required>
            <Input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="Dr. John Doe" required />
          </FormField>

          {!editId && (
            <>
              <FormField label="Email" required>
                <Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="dokter@klinik.com" required />
              </FormField>
              <FormField label="Password" required>
                <Input type="password" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min. 6 karakter" required minLength={6} />
              </FormField>
            </>
          )}

          <FormField label="Departemen" required>
            <Select value={formData.department_id} onChange={e => setFormData(p => ({ ...p, department_id: e.target.value }))} required>
              <option value="">-- Pilih Departemen --</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </FormField>

          <FormField label="Nomor SIP (Surat Izin Praktik)" required>
            <Input type="text" value={formData.license_number}
              onChange={e => setFormData(p => ({ ...p, license_number: e.target.value }))}
              placeholder="SIP-2024-XXXXX" required />
          </FormField>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-6 py-2.5 border border-whisper-border rounded-xl text-label-md">Batal</button>
            <BtnPrimary type="submit" loading={submitting}>
              {editId ? 'Simpan Perubahan' : 'Tambah Dokter'}
            </BtnPrimary>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete?.id)}
        title="Hapus Dokter"
        message={`Yakin ingin menghapus "${confirmDelete?.name}"? Akun user terkait juga akan dihapus.`}
        confirmLabel="Hapus" danger
      />
    </DashboardLayout>
  );
};

export default DoctorPage;
