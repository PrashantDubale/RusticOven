'use client'

import { formatPrice } from '@/lib/utils-cafe'

export function BarChart({ title, data, formatValue = formatPrice }) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">{title}</h3>
      
      <div className="space-y-4">
        {data.map((item, idx) => {
          const percentage = (item.value / maxValue) * 100
          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-base text-muted-foreground">{item.label}</span>
                <span className="text-base font-semibold text-foreground">{formatValue(item.value)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function LineChart({ title, data }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">{title}</h3>
      
      <div className="h-64 flex items-end justify-around gap-4">
        {data.map((item, idx) => {
          const maxValue = Math.max(...data.map(d => d.value))
          const height = (item.value / maxValue) * 100
          
          return (
            <div key={idx} className="flex-1 min-w-0 flex flex-col items-center gap-2">
              <div className="w-full bg-gradient-to-t from-accent/50 to-accent rounded-t-lg transition-all hover:from-accent to-accent"
                style={{ height: `${height}%`, minHeight: '8px' }}
              />
              <span className="text-sm text-muted-foreground text-center truncate w-full">{item.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BarChart
