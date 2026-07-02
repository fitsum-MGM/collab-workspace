import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { classNames, navItems } from './collabUiUtils'

export const LogoMark = ({ compact = false }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-indigo-500/15 text-indigo-400 ring-1 ring-inset ring-indigo-500/30">
      <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600, 'opsz' 24" }}>
        hub
      </span>
    </div>
    {!compact && (
      <div>
        <div className="text-[15px] font-semibold tracking-tight text-[#F5F5F5]">CollabSpace</div>
        <div className="text-[11px] text-[#888888]">Premium collaborative workspace</div>
      </div>
    )}
  </div>
)

export const Avatar = ({ name, size = 'h-8 w-8', tone = 'bg-indigo-500/15 text-indigo-300' }) => {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className={classNames('grid place-items-center rounded-full border border-[#2A2A2A] text-[11px] font-semibold', size, tone)}>
      {initials}
    </div>
  )
}

export const AvatarStack = ({ users = [], maxVisible = 3, overlap = '-space-x-2.5' }) => {
  const visibleUsers = users.slice(0, maxVisible)
  const overflowCount = users.length - visibleUsers.length

  return (
    <div className={classNames('flex items-center', overlap)}>
      {visibleUsers.map((user) => (
        <div key={user.name} className="group relative" title={user.name}>
          <div className="rounded-full border-2 border-[#0F0F0F] transition-transform duration-150 group-hover:scale-110">
            <Avatar name={user.name} tone={user.tone} size="h-8 w-8" />
          </div>
          <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1 text-[10px] text-[#F5F5F5] opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
            {user.name}
          </div>
        </div>
      ))}
      {overflowCount > 0 && (
        <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#0F0F0F] bg-indigo-500/20 text-[10px] font-semibold text-indigo-200">
          +{overflowCount}
        </div>
      )}
    </div>
  )
}

export const PrimaryButton = ({ children, className = '', ...props }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    whileHover={{ y: -1 }}
    className={classNames(
      'inline-flex items-center justify-center gap-2 rounded-[12px] bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_36px_rgba(99,102,241,0.24)] transition duration-150 hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50',
      className,
    )}
    {...props}
  >
    {children}
  </motion.button>
)

export const GhostButton = ({ children, className = '', ...props }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    whileHover={{ y: -1 }}
    className={classNames(
      'inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 text-sm font-semibold text-[#F5F5F5] transition duration-150 hover:border-indigo-500/50 hover:bg-[#202020] focus:outline-none focus:ring-2 focus:ring-indigo-400/30',
      className,
    )}
    {...props}
  >
    {children}
  </motion.button>
)

export const Input = ({ label, icon, className = '', ...props }) => (
  <label className="block">
    {label && <div className="mb-2 text-sm font-medium text-[#888888]">{label}</div>}
    <div className="group relative">
      {icon && (
        <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-[#888888] transition-colors duration-150 group-focus-within:text-indigo-400">
          {icon}
        </span>
      )}
      <input
        className={classNames(
          'w-full rounded-[12px] border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 text-sm text-[#F5F5F5] transition duration-150 placeholder:text-[#888888]/75 focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/15',
          icon ? 'pl-11' : '',
          className,
        )}
        {...props}
      />
    </div>
  </label>
)

export const SurfaceCard = ({ children, className = '', ...props }) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.18 }}
    className={classNames('rounded-[12px] border border-[#2A2A2A] bg-[#1A1A1A] shadow-[0_18px_40px_rgba(0,0,0,0.24)]', className)}
    {...props}
  >
    {children}
  </motion.div>
)

export const StatCard = ({ label, value, change, icon }) => (
  <SurfaceCard className="p-5">
    <div className="mb-4 flex items-center justify-between">
      <div className="text-xs uppercase tracking-[0.2em] text-[#888888]">{label}</div>
      <div className="grid h-9 w-9 place-items-center rounded-[12px] bg-indigo-500/10 text-indigo-300">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </div>
    </div>
    <div className="flex items-end justify-between gap-4">
      <div className="text-3xl font-semibold tracking-tight text-[#F5F5F5]">{value}</div>
      <div className="text-sm text-emerald-400">{change}</div>
    </div>
  </SurfaceCard>
)

export const WorkspaceCard = ({ workspace, onClick }) => (
  <motion.button
    type="button"
    whileHover={{ y: -6 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="group flex min-h-[220px] flex-col justify-between rounded-[12px] border border-[#2A2A2A] bg-[#1A1A1A] p-6 text-left text-[#F5F5F5] shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition duration-150 hover:border-indigo-500/45 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.2),0_22px_50px_rgba(99,102,241,0.08)]"
  >
    <div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-[12px] bg-indigo-500/15 text-lg font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/25">
          {workspace.name[0]}
        </div>
        <span className="rounded-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-1 text-[11px] font-medium text-[#888888]">
          {workspace.role}
        </span>
      </div>
      <div className="text-lg font-semibold tracking-tight">{workspace.name}</div>
      <p className="mt-2 text-sm leading-6 text-[#888888]">{workspace.description}</p>
    </div>
    <div className="mt-6 flex items-center justify-between border-t border-[#2A2A2A] pt-4 text-sm text-[#888888]">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-indigo-300">description</span>
        <span>{workspace.documents} documents</span>
      </div>
      <span>{workspace.updatedAt}</span>
    </div>
  </motion.button>
)

export const AuthShell = ({ title, eyebrow, children, footer }) => (
  <div className="relative min-h-screen overflow-hidden bg-[#0F0F0F] px-4 py-10 text-[#F5F5F5] sm:px-6 lg:px-8">
    <div className="auth-glow left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
    <div className="auth-glow left-[15%] top-[20%] hidden sm:block" />
    <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
      <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden lg:block">
          <LogoMark />
          <div className="mt-10 max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-xs font-medium text-[#888888]">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Real-time collaboration, built for premium teams
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-[#F5F5F5]">Design, write, and coordinate in one dark workspace.</h1>
            <p className="max-w-lg text-base leading-8 text-[#888888]">
              CollabSpace keeps the interface quiet and deliberate so your team can move fast without visual noise.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto w-full max-w-md rounded-[12px] border border-[#2A2A2A] bg-[#1A1A1A]/95 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          <div className="lg:hidden">
            <LogoMark />
          </div>
          <div className="mb-8 mt-6 lg:mt-0">
            <div className="text-xs uppercase tracking-[0.24em] text-[#888888]">{eyebrow}</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#F5F5F5]">{title}</h2>
          </div>
          {children}
          {footer && <div className="mt-6">{footer}</div>}
        </motion.div>
      </div>
    </div>
  </div>
)

export const WorkspaceShell = ({ active = 'Dashboard', children, onLogout, user, sidebarActions, headerRight, onSidebarToggle, collapsed = false }) => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F5F5F5]" style={{ '--sidebar-width': collapsed ? '88px' : '240px' }}>
      <motion.aside
        animate={{ width: collapsed ? 88 : 240 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-y-0 left-0 z-40 hidden border-r border-[#2A2A2A] bg-[#1A1A1A] px-4 py-5 md:flex md:flex-col"
      >
        <div className="flex items-start justify-between gap-3">
          <LogoMark compact={collapsed} />
          <button
            type="button"
            onClick={onSidebarToggle}
            className="rounded-[12px] border border-[#2A2A2A] bg-[#0F0F0F] p-2 text-[#888888] transition duration-150 hover:border-indigo-500/40 hover:text-[#F5F5F5]"
          >
            <span className="material-symbols-outlined text-[18px]">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
          </button>
        </div>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const isActive = item.label === active
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.to)}
                className={classNames(
                  'flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-sm font-medium transition duration-150',
                  isActive ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-500/25' : 'text-[#888888] hover:bg-[#202020] hover:text-[#F5F5F5]',
                  collapsed ? 'justify-center px-3' : '',
                )}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {sidebarActions}

        <div className="mt-auto border-t border-[#2A2A2A] pt-4">
          {!collapsed && (
            <div className="flex items-center gap-3 rounded-[12px] bg-[#0F0F0F] p-3">
              <Avatar name={user?.name || 'Fitsum'} tone="bg-indigo-500/15 text-indigo-200" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-[#F5F5F5]">{user?.name || 'Fitsum'}</div>
                <div className="truncate text-xs text-[#888888]">Team lead</div>
              </div>
            </div>
          )}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onLogout}
            className={classNames(
              'mt-3 flex w-full items-center gap-3 rounded-[12px] border border-[#2A2A2A] bg-[#0F0F0F] px-4 py-3 text-sm font-medium text-[#888888] transition duration-150 hover:border-red-500/40 hover:text-red-400',
              collapsed ? 'justify-center px-3' : '',
            )}
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            {!collapsed && <span>Logout</span>}
          </motion.button>
        </div>
      </motion.aside>

      <main className="min-h-screen md:pl-[var(--sidebar-width)]">
        <div className="border-b border-[#2A2A2A] bg-[#0F0F0F]/95 backdrop-blur-xl md:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <LogoMark compact />
            {headerRight}
          </div>
        </div>
        <div className="px-4 py-4 pb-24 sm:px-6 lg:px-8">{children}</div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#2A2A2A] bg-[#1A1A1A]/98 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-4 px-3 py-2">
          {navItems.map((item) => {
            const isActive = item.label === active
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.to)}
                className={classNames(
                  'flex flex-col items-center gap-1 rounded-[12px] px-2 py-2 text-[11px] font-medium transition duration-150',
                  isActive ? 'bg-indigo-500/15 text-indigo-300' : 'text-[#888888]',
                )}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const SearchField = ({ placeholder = 'Search...', className = '' }) => (
  <div className={classNames('relative w-full', className)}>
    <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-[#888888]">search</span>
    <input
      placeholder={placeholder}
      className="w-full rounded-[12px] border border-[#2A2A2A] bg-[#1A1A1A] py-3 pl-11 pr-4 text-sm text-[#F5F5F5] transition duration-150 placeholder:text-[#888888]/75 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15"
    />
  </div>
)

export const TableActionButton = ({ icon, tone = 'text-[#888888]', className = '' }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    type="button"
    className={classNames('grid h-9 w-9 place-items-center rounded-[12px] border border-[#2A2A2A] bg-[#0F0F0F] transition duration-150 hover:border-indigo-500/35 hover:bg-[#202020]', tone, className)}
  >
    <span className="material-symbols-outlined text-[18px]">{icon}</span>
  </motion.button>
)

export const EmptyState = ({ title, description, actionLabel }) => (
  <div className="grid place-items-center rounded-[12px] border border-dashed border-[#2A2A2A] bg-[#1A1A1A] px-6 py-16 text-center">
    <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-indigo-500/10 text-indigo-300">
      <span className="material-symbols-outlined text-[28px]">folder_open</span>
    </div>
    <h3 className="text-xl font-semibold text-[#F5F5F5]">{title}</h3>
    <p className="mt-2 max-w-md text-sm leading-7 text-[#888888]">{description}</p>
    <PrimaryButton className="mt-6">
      <span className="material-symbols-outlined text-[18px]">add</span>
      {actionLabel}
    </PrimaryButton>
  </div>
)

export const ModalSheet = ({ open, onClose, title, description, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <button type="button" aria-label="Close modal" className="absolute inset-0 bg-black/60" onClick={onClose} />
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="relative z-10 w-full max-w-lg rounded-[12px] border border-[#2A2A2A] bg-[#1A1A1A] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.5)]"
        >
          <div className="mb-5">
            <div className="text-xl font-semibold text-[#F5F5F5]">{title}</div>
            <p className="mt-1 text-sm leading-6 text-[#888888]">{description}</p>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)
