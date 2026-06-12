import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError(''); // Clear validation on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setValidationError('Semua kolom wajib diisi');
      return;
    }
    if (formData.password.length < 6) {
      setValidationError('Password minimal 6 karakter');
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      // Error handled by context and displayed below
    }
  };

  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-canvas-white">
      {/* Left Side: Editorial Content */}
      <section className="lg:w-1/2 w-full flex flex-col justify-center gallery-airy-padding relative overflow-hidden">
        {/* Branding */}
        <div className="absolute top-12 left-margin-edge">
          <span className="text-headline-lg tracking-tighter text-primary">Clynic</span>
        </div>
        
        {/* Content Cluster */}
        <div className="max-w-[65ch] space-y-12 z-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-surface-container-low rounded-full border border-whisper-border">
            <span className="relative flex h-3 w-3">
              <span className="active-dot-pulse absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-container"></span>
            </span>
            <span className="text-label-md text-on-surface-variant uppercase tracking-widest">
              Sistem Informasi Klinik Modern
            </span>
          </div>
          
          <h1 className="text-display-lg leading-tight text-on-background">
            Layanan kesehatan,
            <span className="inline-block w-16 h-10 bg-primary-container/20 rounded-lg align-middle mx-3 shadow-sm flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">ecg_heart</span>
            </span> 
            <br />
            digital dan terpadu.
          </h1>
          
          <p className="text-body-lg text-on-surface-variant">
            Clynic menghubungkan tenaga medis dan pasien dalam satu platform yang aman. Masuk ke sistem untuk mengelola rekam medis, janji temu, dan data klinik dengan efisiensi tinggi.
          </p>
          
          <div className="pt-8 flex gap-12">
            <div className="flex flex-col gap-1">
              <span className="text-label-sm text-muted-slate uppercase">Security Level</span>
              <span className="text-label-md text-primary">ENCRYPTED L3</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-label-sm text-muted-slate uppercase">Akses Role</span>
              <span className="text-label-md text-primary">Multi-Layered</span>
            </div>
          </div>
        </div>
        
        {/* Background Aesthetic (Subtle) */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Right Side: Auth Container */}
      <section className="lg:w-1/2 w-full flex items-center justify-center gallery-airy-padding bg-background/30">
        <div className="w-full max-w-xl bg-pure-surface rounded-xl border border-whisper-border whisper-shadow p-12 lg:p-16">
          <div className="mb-12">
            <h2 className="text-headline-md text-on-surface mb-2">Selamat Datang</h2>
            <p className="text-body-md text-on-surface-variant">Masukkan kredensial Anda untuk mengakses sistem Clynic.</p>
          </div>

          {(error || validationError) && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined shrink-0 mt-0.5">error</span>
              <p className="text-body-md font-medium">{validationError || error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="email">
                Email Address
              </label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@klinik.com"
                className="input-clinical"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-label-sm text-primary hover:underline transition-all">
                  Lupa Password?
                </Link>
              </div>
              <div className="relative">
                <input 
                  id="password" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-clinical pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-slate hover:text-primary transition-colors"
                  tabIndex="-1"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-4 space-y-6">
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary flex items-center justify-center gap-2 w-full py-5 text-label-md rounded-lg spring-interaction hover:opacity-90 active:scale-[0.98] transition-all bg-primary text-on-primary"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Akses Dashboard</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center">
                <p className="text-body-md text-on-surface-variant">
                  Pasien baru? 
                  <Link to="/register" className="text-primary font-bold hover:underline ml-2">
                    Daftar di sini
                  </Link>
                </p>
              </div>
            </div>
          </form>

          <div className="mt-16 pt-8 border-t border-whisper-border flex flex-wrap gap-6 justify-center">
            <span className="text-label-sm text-muted-slate">© 2024 Clynic Systems. All rights reserved.</span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
