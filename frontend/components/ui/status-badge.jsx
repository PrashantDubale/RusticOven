import { getStatusColor, getStatusText } from '@/lib/utils-cafe'

export function StatusBadge({ status, size = 'md' }) {
  const colorClass = getStatusColor(status)
  const sizeClass = {
    sm: 'px-2 py-1 text-base',
    md: 'px-3 py-1 text-base',
    lg: 'px-4 py-2 text-lg',
  }

  return (
    <span className={`inline-block rounded-full font-medium ${colorClass} ${sizeClass[size]}`}>
      {getStatusText(status)}
    </span>
  )
}
