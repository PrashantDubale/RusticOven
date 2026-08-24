export default function KPICard({ title, value, change, icon: Icon, trend = 'up' }) {
  const isPositive = trend === 'up' ? change >= 0 : change <= 0

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 bg-accent/10 rounded-lg">
          <Icon className="w-5 h-5 text-accent" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-3xl font-bold text-foreground">{value}</div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${
          isPositive ? 'text-green-500' : 'text-red-500'
        }`}>
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(change)}% vs last month</span>
        </div>
      </div>
    </div>
  )
}
