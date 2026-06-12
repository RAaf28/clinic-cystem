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
    <main className="min-h-screen flex flex-col md:flex-row bg-canvas-white overflow-x-hidden">
      {/* Left Side: Clinical Visual Editorial */}
      <aside className="w-full md:w-1/2 min-h-[30vh] md:min-h-screen p-8 md:p-16 flex flex-col justify-between relative bg-surface-container-lowest overflow-hidden">
        <div className="z-10">
          <h1 className="text-headline-lg tracking-tighter text-primary">Clynic</h1>
          <p className="text-label-sm text-muted-slate mt-2 tracking-widest uppercase">Portal Pasien</p>
        </div>
        
        <div className="z-10 max-w-xl my-8 md:my-0">
          <h2 className="text-display-lg text-on-surface leading-tight">
            Akses kesehatan,
            <span className="inline-block align-middle mx-3 bg-primary-container/20 px-4 py-2 rounded-xl text-primary shadow-sm">
              <span className="material-symbols-outlined text-4xl">medical_information</span>
            </span> 
            dalam genggaman.
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-6">
            Daftar sebagai pasien untuk mengelola janji temu dokter, melihat riwayat rekam medis, dan mengakses tagihan klinik secara transparan.
          </p>
        </div>

        <div className="absolute -right-20 bottom-1/4 w-80 h-80 opacity-5 pointer-events-none">
          <div className="grid grid-cols-4 grid-rows-4 gap-4 w-full h-full">
            <div className="bg-primary col-span-2 row-span-2 rounded-xl"></div>
            <div className="border border-primary rounded-full"></div>
            <div className="bg-primary-container rounded-lg"></div>
            <div className="bg-primary rounded-xl col-span-3"></div>
          </div>
        </div>
      </aside>

      {/* Right Side: Auth Form Container */}
      <section className="w-full md:w-1/2 min-h-screen bg-canvas-white flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg bg-pure-surface rounded-xl whisper-shadow border border-whisper-border p-8 md:p-12 flex flex-col my-8">
          <header className="mb-8">
            <h2 className="text-headline-md text-on-surface mb-2">Registrasi Pasien</h2>
            <p className="text-body-md text-steel-secondary">Lengkapi data diri Anda untuk membuat akun Clynic.</p>
          </header>

          {(error || validationError) && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined shrink-0 mt-0.5">error</span>
              <p className="text-body-md font-medium">{validationError || error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label className="block text-label-md text-on-surface-variant mb-2 uppercase tracking-wider" htmlFor="name">
                Nama Lengkap
              </label>
              <input 
                id="name" name="name" type="text" required
                value={formData.name} onChange={handleChange}
                placeholder="Sesuai KTP"
                className="input-clinical" disabled={isLoading}
              />
            </div>

            <div className="group">
              <label className="block text-label-md text-on-surface-variant mb-2 uppercase tracking-wider" htmlFor="email">
                Email Aktif
              </label>
              <input 
                id="email" name="email" type="email" required
                value={formData.email} onChange={handleChange}
                placeholder="nama@email.com"
                className="input-clinical" disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="group">
                <label className="block text-label-md text-on-surface-variant mb-2 uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <input 
                  id="password" name="password" type="password" required
                  value={formData.password} onChange={handleChange}
                  placeholder="Min 6 karakter"
                  className="input-clinical" disabled={isLoading}
                />
              </div>
              <div className="group">
                <label className="block text-label-md text-on-surface-variant mb-2 uppercase tracking-wider" htmlFor="confirmPassword">
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

            <div className="group">
              <label className="block text-label-md text-on-surface-variant mb-2 uppercase tracking-wider" htmlFor="date_of_birth">
                Tanggal Lahir
              </label>
              <input 
                id="date_of_birth" name="date_of_birth" type="date" required
                value={formData.date_of_birth} onChange={handleChange}
                className="input-clinical" disabled={isLoading}
              />
            </div>

            <div className="group">
              <label className="block text-label-md text-on-surface-variant mb-2 uppercase tracking-wider" htmlFor="address">
                Alamat Lengkap
              </label>
              <textarea 
                id="address" name="address" rows="2" required
                value={formData.address} onChange={handleChange}
                placeholder="Alamat domisili saat ini"
                className="input-clinical resize-none" disabled={isLoading}
              ></textarea>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary w-full py-4 text-label-md rounded-lg spring-interaction hover:opacity-90 active:scale-[0.98] transition-all bg-primary-container text-on-primary-container flex items-center justify-center gap-3"
              >
                {isLoading ? 'Memproses...' : 'Buat Akun Pasien'}
                {!isLoading && <span className="material-symbols-outlined text-xl">arrow_forward</span>}
              </button>
            </div>
          </form>

          <footer className="mt-8 pt-6 border-t border-whisper-border text-center">
            <p className="text-body-md text-steel-secondary">
              Sudah memiliki akun? 
              <Link to="/login" className="text-primary font-bold hover:underline ml-2 transition-all">
                Masuk di sini
              </Link>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
};

export default RegisterPage;
