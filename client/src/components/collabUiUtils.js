export const navItems = [
  { label: 'Dashboard', icon: 'space_dashboard', to: '/dashboard#overview' },
  { label: 'Workspaces', icon: 'workspaces', to: '/dashboard#workspaces' },
  { label: 'Recent', icon: 'history', to: '/dashboard#recent' },
  { label: 'Settings', icon: 'settings', to: '/dashboard#settings' },
]

export const classNames = (...values) => values.filter(Boolean).join(' ')
