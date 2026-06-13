import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    date_of_birth: '',
    address: '',
    role_id: 3 // 3 = Pasien
  });
  
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!formData.name || !formData.email || !formData.password || !formData.date_of_birth || !formData.address) {
      setValidationError('Semua kolom wajib diisi');
      return;
    }
    if (formData.password.length < 6) {
      setValidationError('Password minimal 6 karakter');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Password dan Konfirmasi Password tidak cocok');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        date_of_birth: formData.date_of_birth,
        address: formData.address,
        role_id: formData.role_id
      };
      
      await register(payload);
      navigate('/login', { state: { message: 'Registrasi berhasil. Silakan login.' } });
    } catch (err) {
      // Error handled by context
    }
  };

  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-canvas-white">
      {/* Left Side: Editorial Content */}
      <section className="lg:w-1/2 w-full flex flex-col justify-center gallery-airy-padding relative overflow-hidden bg-surface-container-lowest">
        <div className="max-w-[65ch] space-y-12 z-10">
          <h1 className="text-display-lg leading-tight text-on-background">
            Akses kesehatan, dalam genggaman.
            <span className="inline-flex w-16 h-10 bg-primary-container/20 rounded-lg align-middle ml-3 shadow-sm items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">medical_information</span>
            </span>
          </h1>
          
          <p className="text-body-lg text-on-surface-variant">
            Daftar sebagai pasien untuk mengelola janji temu dokter, melihat riwayat rekam medis, dan mengakses tagihan klinik secara transparan.
          </p>
        </div>

        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Right Side: Auth Form Container */}
      <section className="lg:w-1/2 w-full flex items-center justify-center gallery-airy-padding bg-background/30">
        <div className="w-full max-w-xl bg-pure-surface rounded-xl border border-whisper-border whisper-shadow p-12 lg:p-16">
          <header className="mb-12">
            <h2 className="text-headline-md text-on-surface mb-2">Registrasi Pasien</h2>
            <p className="text-body-md text-on-surface-variant">Lengkapi data diri Anda untuk membuat akun Clynic.</p>
          </header>

          {(error || validationError) && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined shrink-0 mt-0.5">error</span>
              <p className="text-body-md font-medium">{validationError || error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="name">
                Nama Lengkap
              </label>
              <input 
                id="name" name="name" type="text" required
                value={formData.name} onChange={handleChange}
                placeholder="Sesuai KTP"
                className="input-clinical" disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="email">
                Email Aktif
              </label>
              <input 
                id="email" name="email" type="email" required
                value={formData.email} onChange={handleChange}
                placeholder="nama@email.com"
                className="input-clinical" disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <input 
                  id="password" name="password" type="password" required
                  value={formData.password} onChange={handleChange}
                  placeholder="Min 6 karakter"
                  className="input-clinical" disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="confirmPassword">
                  Konfirmasi Password
                </label>
                <input 
                  id="confirmPassword" name="confirmPassword" type="password" required
                  value={formData.confirmPassword} onChange={handleChange}
                  placeholder="Ulangi password"
                  className="input-clinical" disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="date_of_birth">
                Tanggal Lahir
              </label>
              <input 
                id="date_of_birth" name="date_of_birth" type="date" required
                value={formData.date_of_birth} onChange={handleChange}
                className="input-clinical" disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="address">
                Alamat Lengkap
              </label>
              <textarea 
                id="address" name="address" rows="2" required
                value={formData.address} onChange={handleChange}
                placeholder="Alamat domisili saat ini"
                className="input-clinical resize-none" disabled={isLoading}
              ></textarea>
            </div>

            <div className="pt-4 space-y-6">
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary w-full py-5 text-label-md rounded-lg spring-interaction hover:opacity-90 active:scale-[0.98] transition-all bg-primary text-on-primary flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Buat Akun Pasien</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center">
                <p className="text-body-md text-on-surface-variant">
                  Sudah memiliki akun?
                  <Link to="/login" className="text-primary font-bold hover:underline ml-2 transition-all">
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default RegisterPage;
