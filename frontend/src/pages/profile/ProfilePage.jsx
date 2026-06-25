import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/common/DashboardLayout';
import axiosInstance from '../../api/axiosInstance';

// ─── Alert Banner ─────────────────────────────────────────────────────────────
const Alert = ({ type, message }) => {
  if (!message) return null;
  const styles = {
    success: 'bg-primary/10 text-primary border-primary/20',
    error: 'bg-error/10 text-error border-error/20',
  };
  const icons = { success: 'check_circle', error: 'error' };
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-label-md ${styles[type]}`}>
      <span className="material-symbols-outlined text-[18px]">{icons[type]}</span>
      {message}
    </div>
  );
};

const Field = ({ label, name, type = 'text', value, onChange, disabled, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-label-sm text-steel-secondary uppercase tracking-widest" style={{ fontSize: '10px' }}>
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-whisper-border bg-canvas-white text-body-md text-on-surface
        focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all
        disabled:bg-surface-container disabled:text-steel-secondary disabled:cursor-not-allowed"
    />
  </div>
);

const SectionCard = ({ title, icon, children }) => (
  <div className="bg-pure-surface border border-whisper-border rounded-xl whisper-shadow overflow-hidden">
    <div className="flex items-center gap-3 px-7 py-5 border-b border-whisper-border">
      <span className="material-symbols-outlined text-[20px] text-primary"
        style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
        {icon}
      </span>
      <h2 className="text-label-md font-bold uppercase tracking-widest text-on-surface" style={{ fontSize: '11px' }}>
        {title}
      </h2>
    </div>
    <div className="p-7 space-y-5">{children}</div>
  </div>
);

const ProfilePage = () => {
  const { user, loadUser } = useAuth();

  const [infoForm, setInfoForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoAlert, setInfoAlert] = useState(null);

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwAlert, setPwAlert] = useState(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleInfoChange = (e) => setInfoForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handlePwChange = (e) => setPwForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleInfoSubmit = async () => {
    if (!infoForm.name.trim() || !infoForm.email.trim()) {
      setInfoAlert({ type: 'error', message: 'Nama dan email tidak boleh kosong.' });
      return;
    }
    setInfoLoading(true);
    setInfoAlert(null);
    try {
      await axiosInstance.put('/auth/profile', { name: infoForm.name.trim(), email: infoForm.email.trim() });
      await loadUser();
      setInfoAlert({ type: 'success', message: 'Profil berhasil diperbarui.' });
    } catch (err) {
      setInfoAlert({ type: 'error', message: err?.response?.data?.message || 'Gagal memperbarui profil.' });
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePwSubmit = async () => {
    if (!pwForm.current_password || !pwForm.new_password || !pwForm.confirm_password) {
      setPwAlert({ type: 'error', message: 'Semua field password harus diisi.' });
      return;
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwAlert({ type: 'error', message: 'Password baru dan konfirmasi tidak cocok.' });
      return;
    }
    if (pwForm.new_password.length < 6) {
      setPwAlert({ type: 'error', message: 'Password baru minimal 6 karakter.' });
      return;
    }
    setPwLoading(true);
    setPwAlert(null);
    try {
      await axiosInstance.put('/auth/change-password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      setPwAlert({ type: 'success', message: 'Password berhasil diubah.' });
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPwAlert({ type: 'error', message: err?.response?.data?.message || 'Gagal mengubah password.' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">

        <div>
          <p className="text-label-sm text-steel-secondary uppercase tracking-widest mb-1" style={{ fontSize: '10px' }}>
            Akun Saya
          </p>
          <h1 className="text-headline-lg text-primary leading-tight" style={{ fontSize: '32px', fontWeight: 800 }}>
            Profil
          </h1>
        </div>

        <div className="bg-primary-container rounded-xl p-7 flex items-center gap-6 whisper-shadow relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{ fontSize: '26px' }}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="z-10">
            <h2 className="text-white font-bold" style={{ fontSize: '22px' }}>{user?.name}</h2>
            <p className="text-white/70 text-body-md">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-white/90 bg-white/20 uppercase tracking-widest"
              style={{ fontSize: '10px' }}>
              {user?.role}
            </span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        <SectionCard title="Informasi Akun" icon="person">
          <Alert {...(infoAlert || {})} message={infoAlert?.message} />
          <div className="grid grid-cols-1 gap-5">
            <Field label="Nama Lengkap" name="name" value={infoForm.name} onChange={handleInfoChange} placeholder="Masukkan nama lengkap" />
            <Field label="Email" name="email" type="email" value={infoForm.email} onChange={handleInfoChange} placeholder="Masukkan email" />
            <Field label="Role" name="role" value={user?.role || ''} disabled />
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={handleInfoSubmit} disabled={infoLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-label-md font-bold hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[18px]">{infoLoading ? 'progress_activity' : 'save'}</span>
              {infoLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Ubah Password" icon="lock">
          <Alert {...(pwAlert || {})} message={pwAlert?.message} />
          <div className="space-y-5">
            <Field label="Password Saat Ini" name="current_password" type={showPasswords ? 'text' : 'password'} value={pwForm.current_password} onChange={handlePwChange} placeholder="Masukkan password saat ini" />
            <Field label="Password Baru" name="new_password" type={showPasswords ? 'text' : 'password'} value={pwForm.new_password} onChange={handlePwChange} placeholder="Minimal 6 karakter" />
            <Field label="Konfirmasi Password Baru" name="confirm_password" type={showPasswords ? 'text' : 'password'} value={pwForm.confirm_password} onChange={handlePwChange} placeholder="Ulangi password baru" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={() => setShowPasswords((v) => !v)}
              className="flex items-center gap-2 text-label-sm text-steel-secondary hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[16px]">{showPasswords ? 'visibility_off' : 'visibility'}</span>
              {showPasswords ? 'Sembunyikan' : 'Tampilkan'} password
            </button>
            <button onClick={handlePwSubmit} disabled={pwLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-label-md font-bold hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[18px]">{pwLoading ? 'progress_activity' : 'key'}</span>
              {pwLoading ? 'Memproses...' : 'Ubah Password'}
            </button>
          </div>
        </SectionCard>

      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;