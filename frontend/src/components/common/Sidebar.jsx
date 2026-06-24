import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_CONFIG = [
  {
    section: 'Utama',
    items: [
      { icon: 'dashboard', label: 'Dashboard', path: '/dashboard', roles: ['Admin'] },
      { icon: 'calendar_today', label: 'Janji Temu', path: '/appointments', roles: ['Admin', 'Dokter', 'Pasien'] },
    ],
  },
  {
    section: 'Klinik',
    items: [
      { icon: 'group', label: 'Pasien', path: '/patients', roles: ['Admin', 'Dokter'] },
      { icon: 'stethoscope', label: 'Dokter', path: '/doctors', roles: ['Admin'] },
      { icon: 'folder_open', label: 'Rekam Medis', path: '/medical-records', roles: ['Admin', 'Dokter'] },
      { icon: 'receipt_long', label: 'Resep', path: '/prescriptions', roles: ['Admin', 'Dokter'] },
    ],
  },
  {
    section: 'Administrasi',
    items: [
      { icon: 'medication', label: 'Obat', path: '/medicines', roles: ['Admin'] },
      { icon: 'payments', label: 'Pembayaran', path: '/payments', roles: ['Admin'] },
    ],
  },
];

const Sidebar = ({ collapsed = false, onToggle }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const role = user?.role || '';
  const isProfileActive = location.pathname === '/profile';

  return (
    <aside
      className="h-screen fixed left-0 top-0 border-r border-whisper-border bg-pure-surface z-50 flex flex-col transition-all duration-300"
      style={{ width: collapsed ? '72px' : '256px' }}
    >
      <div className="flex flex-col h-full py-8 overflow-y-auto overflow-x-hidden"
        style={{ padding: collapsed ? '32px 0' : '32px 20px' }}>

        {/* ── Logo + Toggle ─────────────────────────────── */}
        <div className={`mb-8 flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-2'}`}>
          {!collapsed && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-white text-[16px]">local_hospital</span>
                </div>
                <h1 className="text-headline-md tracking-tighter text-primary leading-none" style={{ fontSize: '20px' }}>
                  Clynic
                </h1>
              </div>
              <p className="text-steel-secondary uppercase tracking-widest ml-9" style={{ fontSize: '9px' }}>
                Medical Suite
              </p>
            </div>
          )}
          <button
            onClick={onToggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-steel-secondary hover:bg-surface-container-low hover:text-on-surface transition-colors flex-shrink-0"
            title={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {collapsed ? 'menu_open' : 'menu'}
            </span>
          </button>
        </div>

        {/* ── Navigation ───────────────────────────────── */}
        <nav className="flex-1 space-y-6">
          {NAV_CONFIG.map((group) => {
            const visibleItems = group.items.filter(item =>
              !item.roles || item.roles.includes(role)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.section}>
                {!collapsed && (
                  <p className="text-steel-secondary uppercase tracking-widest mb-2 px-2" style={{ fontSize: '9px' }}>
                    {group.section}
                  </p>
                )}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                      (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-3 rounded-xl text-sm transition-all duration-200 ${
                          collapsed ? 'justify-center px-0 py-2.5 mx-3' : 'px-3 py-2.5'
                        } ${
                          isActive
                            ? 'text-primary font-bold bg-surface-container-low'
                            : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-[20px] flex-shrink-0"
                          style={{
                            fontVariationSettings: isActive
                              ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                              : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
                            color: isActive ? 'var(--color-primary)' : undefined,
                          }}
                        >
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <>
                            <span className="text-label-md">{item.label}</span>
                            {isActive && (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-container" />
                            )}
                          </>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* ── Bottom Section ───────────────────────────── */}
        <div className="mt-auto pt-5 border-t border-whisper-border space-y-1">

          {/* Profile Link */}
          <Link
            to="/profile"
            title={collapsed ? user?.name || 'Profil' : undefined}
            className={`flex items-center gap-3 rounded-xl transition-all duration-200 ${
              collapsed ? 'justify-center px-0 py-2.5 mx-3' : 'px-3 py-2.5'
            } ${
              isProfileActive
                ? 'text-primary font-bold bg-surface-container-low'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 border border-whisper-border">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-label-md font-bold truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-steel-secondary uppercase tracking-wider" style={{ fontSize: '9px' }}>
                    {user?.role || 'Admin'}
                  </p>
                </div>
                <span
                  className="material-symbols-outlined text-[16px] flex-shrink-0"
                  style={{ fontVariationSettings: isProfileActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  manage_accounts
                </span>
              </>
            )}
          </Link>

          {/* Logout */}
          <button
            onClick={logout}
            title={collapsed ? 'Keluar' : undefined}
            className={`w-full flex items-center gap-3 py-2.5 text-error hover:bg-error/5 transition-colors rounded-xl ${
              collapsed ? 'justify-center px-0 mx-3' : 'px-3'
            }`}
            style={{ width: collapsed ? 'calc(100% - 24px)' : '100%' }}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {!collapsed && <span className="text-label-md">Keluar</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;