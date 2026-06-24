import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import {
  Modal, ConfirmDialog, FormField, Input, Select, BtnPrimary, BtnIcon,
  AppointmentBadge, PageHeader, ErrorBanner, EmptyState, DataTable
} from '../../components/common/ui';
import { useAuth } from '../../context/AuthContext';
import { useAppointment } from '../../context/AppointmentContext';
import * as doctorApi from '../../api/doctorApi';
import * as patientApi from '../../api/patientApi';
import { formatDateTime } from '../../utils/formatDate';

const COLUMNS = ['ID', 'Pasien', 'Dokter', 'Jadwal', 'Status', 'Aksi'];

const AppointmentListPage = () => {
  const { user } = useAuth();
  const { appointments, isLoading, error, fetchAppointments, createAppointment, updateAppointmentStatus, deleteAppointment } = useAppointment();
  const isAdmin = user?.role === 'Admin';
  const isPatient = user?.role === 'Pasien';
  const isDokter = user?.role === 'Dokter';

  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({ patient_id: '', doctor_id: '', schedule_date: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchAppointments(statusFilter ? { status: statusFilter } : {});
  }, [fetchAppointments, statusFilter]);

  useEffect(() => {
    doctorApi.getAll().then(r => setDoctors(r.data?.data || [])).catch(() => {});
    if (isAdmin) patientApi.getAll().then(r => setPatients(r.data?.data || [])).catch(() => {});
  }, [isAdmin]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.doctor_id || !formData.schedule_date) {
      setFormError('Dokter dan jadwal wajib diisi.');
      return;
    }
    const payload = {
      ...formData,
      patient_id: isPatient ? user.profileId : formData.patient_id,
    };
    setSubmitting(true);
    try {
      await createAppointment(payload);
      setShowCreate(false);
      setFormData({ patient_id: '', doctor_id: '', schedule_date: '' });
    } catch (err) {
      setFormError(err?.message || 'Gagal membuat janji temu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      fetchAppointments(statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      alert(err?.message || 'Gagal mengubah status');
    }
    setShowConfirm(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAppointment(id);
    } catch (err) {
      alert(err?.message || 'Gagal menghapus');
    }
    setShowConfirm(null);
  };

  const filtered = appointments.filter((a) => {
    const matchStatus = !statusFilter || a.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      a.patient_name?.toLowerCase().includes(q) ||
      a.doctor_name?.toLowerCase().includes(q) ||
      String(a.id).includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="Manajemen Janji Temu"
        subtitle={`${appointments.length} total janji temu`}
        action={
          (isAdmin || isPatient) && (
            <BtnPrimary onClick={() => setShowCreate(true)}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              Buat Janji
            </BtnPrimary>
          )
        }
      />

      {error && <ErrorBanner message={error} onRetry={() => fetchAppointments()} />}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search bar */}
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-steel-secondary pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pasien, dokter, atau ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-whisper-border bg-pure-surface text-body-md
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-secondary hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 flex-wrap">
          {['', 'Pending', 'Selesai', 'Batal'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full text-label-md transition-colors border ${
                statusFilter === s
                  ? 'bg-primary text-white border-primary'
                  : 'border-whisper-border hover:bg-surface-container-low'
              }`}
            >
              {s || 'Semua'}
            </button>
          ))}
        </div>
      </div>

      {/* Result count when searching */}
      {searchQuery && (
        <p className="text-label-sm text-steel-secondary mb-3" style={{ fontSize: '11px' }}>
          {filtered.length} hasil untuk &quot;{searchQuery}&quot;
        </p>
      )}

      {/* Table */}
      <div className="bg-pure-surface rounded-xl whisper-shadow border border-whisper-border overflow-hidden">
        <DataTable columns={COLUMNS} loading={isLoading} skeletonRows={5}>
          {filtered.length === 0 ? (
            <tr><td colSpan={COLUMNS.length}>
              <EmptyState
                icon="calendar_today"
                message={searchQuery ? `Tidak ada hasil untuk "${searchQuery}".` : 'Belum ada janji temu.'}
              />
            </td></tr>
          ) : filtered.map((a) => (
            <tr key={a.id} className="hover:bg-surface-container-low/50 transition-colors">
              <td className="px-6 py-4 text-steel-secondary" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
                #CL-{String(a.id).padStart(4, '0')}
              </td>
              <td className="px-6 py-4 font-bold text-body-md">{a.patient_name}</td>
              <td className="px-6 py-4 text-body-md text-on-surface-variant">{a.doctor_name}</td>
              <td className="px-6 py-4 text-body-md">{formatDateTime(a.schedule_date)}</td>
              <td className="px-6 py-4"><AppointmentBadge status={a.status} /></td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                  <Link to={`/appointments/${a.id}`}>
                    <BtnIcon icon="chevron_right" title="Detail" />
                  </Link>
                  {(isAdmin || isDokter) && a.status === 'Pending' && (
                    <>
                      <BtnIcon icon="check_circle" title="Selesai"
                        onClick={() => setShowConfirm({ id: a.id, action: 'Selesai', label: 'Tandai Selesai' })} />
                      <BtnIcon icon="cancel" title="Batalkan" danger
                        onClick={() => setShowConfirm({ id: a.id, action: 'Batal', label: 'Batalkan', isDanger: true })} />
                    </>
                  )}
                  {isAdmin && (
                    <BtnIcon icon="delete" title="Hapus" danger
                      onClick={() => setShowConfirm({ id: a.id, action: 'delete', label: 'Hapus', isDanger: true })} />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Buat Janji Temu Baru" size="md">
        <form onSubmit={handleCreate} className="space-y-5">
          {formError && <ErrorBanner message={formError} />}

          {isAdmin && (
            <FormField label="Pasien" required>
              <Select value={formData.patient_id} onChange={e => setFormData(p => ({ ...p, patient_id: e.target.value }))} required>
                <option value="">-- Pilih Pasien --</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </FormField>
          )}

          <FormField label="Dokter" required>
            <Select value={formData.doctor_id} onChange={e => setFormData(p => ({ ...p, doctor_id: e.target.value }))} required>
              <option value="">-- Pilih Dokter --</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.department_name}</option>)}
            </Select>
          </FormField>

          <FormField label="Tanggal & Waktu" required>
            <Input type="datetime-local" value={formData.schedule_date}
              onChange={e => setFormData(p => ({ ...p, schedule_date: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)} required />
          </FormField>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowCreate(false)}
              className="px-6 py-2.5 border border-whisper-border rounded-xl text-label-md hover:bg-surface-container-low transition-colors">
              Batal
            </button>
            <BtnPrimary type="submit" loading={submitting}>Buat Janji</BtnPrimary>
          </div>
        </form>
      </Modal>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={!!showConfirm && showConfirm.action !== 'delete'}
        onClose={() => setShowConfirm(null)}
        onConfirm={() => showConfirm && handleStatusChange(showConfirm.id, showConfirm.action)}
        title={showConfirm?.label || ''}
        message={`Yakin ingin mengubah status menjadi "${showConfirm?.action}"?`}
        confirmLabel={showConfirm?.label}
        danger={showConfirm?.isDanger}
      />
      <ConfirmDialog
        open={!!showConfirm && showConfirm.action === 'delete'}
        onClose={() => setShowConfirm(null)}
        onConfirm={() => showConfirm && handleDelete(showConfirm.id)}
        title="Hapus Janji Temu"
        message="Yakin ingin menghapus janji temu ini? Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Hapus"
        danger
      />
    </DashboardLayout>
  );
};

export default AppointmentListPage;