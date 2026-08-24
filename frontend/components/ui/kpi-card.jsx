import { TrendingUp, TrendingDown } from 'lucide-react'

export function KPICard({
  title,
  value,
  change,
  changeText,
  icon: Icon,
  trend = 'neutral',
  subtext,
}) {
  const isPositive = trend === 'up' || (change && change > 0)
  const isNegative = trend === 'down' || (change && change < 0)

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-foreground/60 text-lg mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtext && <p className="text-base text-foreground/40 mt-1">{subtext}</p>}
        </div>
        {Icon && <Icon size={24} className="text-accent/40" />}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-2 text-lg">
          {isPositive && <TrendingUp size={16} className="text-green-500" />}
          {isNegative && <TrendingDown size={16} className="text-red-500" />}
          <span className={isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-foreground/60'}>
            {Math.abs(change)}% {changeText || 'change'}
          </span>
        </div>
      )}
    </div>
  )
}
