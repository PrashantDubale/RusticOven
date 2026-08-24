export default function DataTable({ columns, data, actions }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((col) => (
                <th key={col.accessor} className={`px-6 py-4 text-left text-sm font-semibold text-muted-foreground ${col.width || ''}`}>
                  {col.header}
                </th>
              ))}
              {actions && <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                {columns.map((col) => (
                  <td key={`${idx}-${col.accessor}`} className="px-6 py-4 text-sm text-foreground">
                    {row[col.accessor]}
                  </td>
                ))}
                {actions && <td className="px-6 py-4">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-muted-foreground text-sm">No data available</p>
        </div>
      )}
    </div>
  )
}
