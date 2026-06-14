// ─── Shared reusable UI atoms untuk semua halaman Fase 4 ─────────────────────

/** Skeleton loader */
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-surface-container rounded-lg ${className}`} />
);

/** Status badge untuk Appointment */
export const AppointmentBadge = ({ status }) => {
  const map = {
    Pending:  'bg-amber-100 text-amber-700 border border-amber-200',
    Selesai:  'bg-primary/10 text-primary border border-primary/20',
    Batal:    'bg-error/10 text-error border border-error/20',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-label-sm uppercase tracking-wider ${map[status] || map.Pending}`}
      style={{ fontSize: '10px' }}>
      {status}
    </span>
  );
};

/** Status badge untuk Payment */
export const PaymentBadge = ({ status }) => {
  const map = {
    'Belum Bayar': 'bg-amber-100 text-amber-700 border border-amber-200',
    'Lunas':       'bg-primary/10 text-primary border border-primary/20',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-label-sm uppercase tracking-wider ${map[status] || map['Belum Bayar']}`}
      style={{ fontSize: '10px' }}>
      {status}
    </span>
  );
};

/** Stock badge untuk Medicine */
export const StockBadge = ({ stock }) => {
  if (stock < 10) return (
    <span className="px-2.5 py-1 rounded-full bg-error/10 text-error border border-error/20 text-label-sm" style={{ fontSize: '10px' }}>
      ⚠ Menipis ({stock})
    </span>
  );
  return (
    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-label-sm" style={{ fontSize: '10px' }}>
      {stock}
    </span>
  );
};

/** Error banner */
export const ErrorBanner = ({ message, onRetry }) => (
  <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-body-md animate-fade-in-up">
    <span className="material-symbols-outlined">error_outline</span>
    <span>{message}</span>
    {onRetry && (
      <button onClick={onRetry} className="ml-auto text-label-md font-bold hover:underline">Coba Lagi</button>
    )}
  </div>
);

/** Empty state */
export const EmptyState = ({ icon = 'inbox', message = 'Tidak ada data.', action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-steel-secondary">
    <span className="material-symbols-outlined text-5xl mb-3 text-outline-variant">{icon}</span>
    <p className="text-body-md">{message}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

/** Page header */
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-8">
    <div>
      <h1 className="text-headline-md" style={{ fontSize: '26px' }}>{title}</h1>
      {subtitle && <p className="text-body-md text-steel-secondary mt-1">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

/** Modal wrapper */
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizeClass = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizeClass} bg-pure-surface rounded-2xl whisper-shadow border border-whisper-border max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-whisper-border sticky top-0 bg-pure-surface">
          <h3 className="text-headline-md" style={{ fontSize: '20px' }}>{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-steel-secondary">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="px-8 py-6">{children}</div>
      </div>
    </div>
  );
};

/** Confirm dialog */
export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Hapus', danger = true }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p className="text-body-md text-steel-secondary mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <button onClick={onClose} className="px-6 py-2.5 border border-whisper-border rounded-xl text-label-md hover:bg-surface-container-low transition-colors">
        Batal
      </button>
      <button
        onClick={onConfirm}
        className={`px-6 py-2.5 rounded-xl text-label-md text-white transition-colors ${danger ? 'bg-error hover:bg-error/80' : 'bg-primary hover:bg-on-primary-fixed-variant'}`}
      >
        {confirmLabel}
      </button>
    </div>
  </Modal>
);

/** Form field wrapper */
export const FormField = ({ label, required, children, error }) => (
  <div className="space-y-1.5">
    <label className="text-label-md text-on-surface-variant block">
      {label} {required && <span className="text-error">*</span>}
    </label>
    {children}
    {error && <p className="text-label-sm text-error">{error}</p>}
  </div>
);

/** Input */
export const Input = ({ className = '', ...props }) => (
  <input
    className={`input-clinical ${className}`}
    {...props}
  />
);

/** Select */
export const Select = ({ className = '', children, ...props }) => (
  <select
    className={`input-clinical ${className}`}
    {...props}
  >
    {children}
  </select>
);

/** Textarea */
export const Textarea = ({ className = '', rows = 3, ...props }) => (
  <textarea
    rows={rows}
    className={`input-clinical resize-none ${className}`}
    {...props}
  />
);

/** Primary button */
export const BtnPrimary = ({ children, loading, className = '', ...props }) => (
  <button
    disabled={loading}
    className={`px-6 py-2.5 bg-primary text-white rounded-xl text-label-md spring-interaction hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${className}`}
    {...props}
  >
    {loading && <span className="clinical-spinner border-white/30 border-t-white" />}
    {children}
  </button>
);

/** Danger button */
export const BtnDanger = ({ children, ...props }) => (
  <button
    className="px-4 py-2 bg-error/10 text-error hover:bg-error/20 rounded-lg text-label-md transition-colors"
    {...props}
  >
    {children}
  </button>
);

/** Icon button */
export const BtnIcon = ({ icon, title, onClick, danger = false }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
      danger
        ? 'text-error hover:bg-error/10'
        : 'text-on-surface-variant hover:bg-surface-container-low'
    }`}
  >
    <span className="material-symbols-outlined text-[18px]">{icon}</span>
  </button>
);

/** Data table shell */
export const DataTable = ({ columns, loading, skeletonRows = 4, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead className="bg-surface-container-low border-b border-whisper-border">
        <tr>
          {columns.map((col) => (
            <th key={col} className="px-6 py-4 text-label-sm text-steel-secondary uppercase tracking-widest whitespace-nowrap">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-whisper-border">
        {loading
          ? Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col} className="px-6 py-4">
                    <Skeleton className="h-4" style={{ width: `${Math.random() * 60 + 40}%` }} />
                  </td>
                ))}
              </tr>
            ))
          : children}
      </tbody>
    </table>
  </div>
);
