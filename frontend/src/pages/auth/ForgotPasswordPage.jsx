import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulasi panggilan API karena endpoint lupa password belum ada
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <main className="flex flex-col md:flex-row min-h-screen bg-canvas-white">
      {/* Sisi Kiri: Konten Editorial Visual*/}
      <section className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-margin-edge py-section-gap relative overflow-hidden bg-surface-container-lowest">
        <div className="max-w-xl z-10">
          <div className="mb-12">
            <h1 className="text-display-lg text-on-background leading-tight">
              Akses kembali,
              <br />
              <span className="text-primary">dengan aman.</span>
            </h1>
          </div>
          <p className="text-body-lg text-on-surface-variant max-w-md opacity-80">
            Clynic memastikan proses pemulihan akses tetap mematuhi standar keamanan medis. Tautan reset hanya akan dikirimkan ke email yang terdaftar di sistem.
          </p>
        </div>

        {/* Elemen Dekoratif*/}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </section>

      {/* Sisi Kanan: Kontainer Formulir */}
      <section className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-margin-edge bg-canvas-white">
        <div className="w-full max-w-lg bg-pure-surface rounded-xl p-8 md:p-12 whisper-shadow border border-whisper-border">
          
          {!isSubmitted ? (
            <>
              <div className="mb-10 text-left">
                <h2 className="text-headline-lg text-on-background mb-4">Lupa Password</h2>
                <p className="text-body-md text-on-surface-variant">
                  Masukkan email yang terdaftar. Jika email ditemukan di sistem, kami akan mengirimkan tautan untuk mengatur ulang password Anda.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-label-md text-on-surface-variant block uppercase tracking-tighter" htmlFor="email">
                    Alamat Email
                  </label>
                  <input 
                    id="email" 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@klinik.com"
                    className="input-clinical"
                    disabled={isLoading}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-primary w-full py-5 rounded-lg text-label-md uppercase tracking-widest spring-interaction"
                >
                  {isLoading ? 'Memproses...' : 'Kirim Tautan Reset'}
                </button>

                <div className="pt-6 border-t border-whisper-border flex justify-center">
                  <Link to="/login" className="text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Kembali ke Login
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl">mark_email_read</span>
              </div>
              <h2 className="text-headline-md text-on-background mb-4">Periksa Email Anda</h2>
              <p className="text-body-md text-on-surface-variant mb-8">
                Kami telah mengirimkan instruksi untuk mengatur ulang password ke <br/><strong className="text-on-surface">{email}</strong>
              </p>
              
              <div className="pt-6 border-t border-whisper-border flex justify-center">
                <Link to="/login" className="btn-primary py-3 px-8 w-auto inline-flex">
                  Kembali ke Login
                </Link>
              </div>
            </div>
          )}

        </div>
      </section>
    </main>
  );
};

export default ForgotPasswordPage;
