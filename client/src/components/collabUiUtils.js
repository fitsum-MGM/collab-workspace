export const navItems = [
  { label: 'Dashboard', icon: 'space_dashboard', to: '/dashboard' },
  { label: 'Workspaces', icon: 'workspaces', to: '/dashboard' },
  { label: 'Recent', icon: 'history', to: '/dashboard' },
  { label: 'Settings', icon: 'settings', to: '/dashboard' },
]

export const classNames = (...values) => values.filter(Boolean).join(' ')
