import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import {
  Modal, FormField, Input, BtnPrimary, BtnIcon,
  PageHeader, ErrorBanner, EmptyState, DataTable, ConfirmDialog, StockBadge
} from '../../components/common/ui';
import { useAuth } from '../../context/AuthContext';
import * as medicineApi from '../../api/medicineApi';
import { formatRupiah } from '../../utils/formatCurrency';

const COLUMNS = ['Nama Obat', 'Harga', 'Stok', 'Aksi'];

const EMPTY_FORM = { name: '', price: '', stock: '' };

const MedicinePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false); // 'create' | 'edit' | false
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await medicineApi.getAll();
      setMedicines(res.data?.data || []);
    } catch (e) {
      setError('Gagal memuat data obat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedicines(); }, []);

  const openCreate = () => {
    setEditId(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (med) => {
    setEditId(med.id);
    setFormData({ name: med.name, price: med.price, stock: med.stock });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.price) {
      setFormError('Nama dan harga wajib diisi.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
      };
      if (editId) {
        await medicineApi.update(editId, payload);
      } else {
        await medicineApi.create(payload);
      }
      setShowForm(false);
      fetchMedicines();
    } catch (err) {
      setFormError(err?.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await medicineApi.remove(id);
      fetchMedicines();
    } catch (err) {
      alert(err?.message || 'Gagal menghapus obat');
    }
    setConfirmDelete(null);
  };

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = medicines.filter(m => m.stock < 10).length;

  return (
    <DashboardLayout>
      <PageHeader
        title="Manajemen Obat"
        subtitle={`${medicines.length} obat terdaftar${lowStockCount > 0 ? ` · ${lowStockCount} stok menipis` : ''}`}
        action={
          isAdmin && (
            <BtnPrimary onClick={openCreate}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah Obat
            </BtnPrimary>
          )
        }
      />

      {error && <ErrorBanner message={error} onRetry={fetchMedicines} />}

      {/* Low stock warning */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-body-md mb-6">
          <span className="material-symbols-outlined">warning</span>
          <span><strong>{lowStockCount} obat</strong> memiliki stok di bawah 10. Segera lakukan restock.</span>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-secondary text-[20px]">search</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama obat..."
          className="input-clinical pl-12 py-2.5"
        />
      </div>

      {/* Table */}
      <div className="bg-pure-surface rounded-xl whisper-shadow border border-whisper-border overflow-hidden">
        <DataTable columns={COLUMNS} loading={loading} skeletonRows={5}>
          {filtered.length === 0 ? (
            <tr><td colSpan={COLUMNS.length}>
              <EmptyState icon="medication" message={search ? 'Obat tidak ditemukan.' : 'Belum ada obat terdaftar.'} />
            </td></tr>
          ) : filtered.map(med => (
            <tr key={med.id} className="hover:bg-surface-container-low/50 transition-colors">
              <td className="px-6 py-4 font-bold text-body-md">{med.name}</td>
              <td className="px-6 py-4 text-body-md" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {formatRupiah(med.price)}
              </td>
              <td className="px-6 py-4"><StockBadge stock={med.stock} /></td>
              <td className="px-6 py-4">
                {isAdmin && (
                  <div className="flex gap-1">
                    <BtnIcon icon="edit" title="Edit" onClick={() => openEdit(med)} />
                    <BtnIcon icon="delete" title="Hapus" danger onClick={() => setConfirmDelete(med)} />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      {/* Form Modal */}
      <Modal open={!!showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Obat' : 'Tambah Obat Baru'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && <ErrorBanner message={formError} />}
          <FormField label="Nama Obat" required>
            <Input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="Contoh: Paracetamol 500mg" required />
          </FormField>
          <FormField label="Harga (Rp)" required>
            <Input type="number" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: e.target.value }))}
              placeholder="5000" min={0} required />
          </FormField>
          <FormField label="Stok">
            <Input type="number" value={formData.stock} onChange={e => setFormData(p => ({ ...p, stock: e.target.value }))}
              placeholder="100" min={0} />
          </FormField>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-6 py-2.5 border border-whisper-border rounded-xl text-label-md">Batal</button>
            <BtnPrimary type="submit" loading={submitting}>
              {editId ? 'Simpan Perubahan' : 'Tambah Obat'}
            </BtnPrimary>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete?.id)}
        title="Hapus Obat"
        message={`Yakin ingin menghapus "${confirmDelete?.name}"? Obat tidak bisa dihapus jika masih digunakan dalam resep.`}
        confirmLabel="Hapus" danger
      />
    </DashboardLayout>
  );
};

export default MedicinePage;
