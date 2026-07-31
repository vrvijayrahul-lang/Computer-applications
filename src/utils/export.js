import * as XLSX from 'xlsx'

// Export an array of plain objects to an .xlsx file
export function exportExcel(rows, filename = 'export') {
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = Object.keys(rows[0] || {}).map((_, i) => ({ wch: 20 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

// Print-friendly table report (uses the browser print dialog -> Save as PDF)
export function printReport(title, columns, rows) {
  const win = window.open('', '_blank', 'width=1000,height=700')
  if (!win) return
  const head = columns.map((c) => `<th style="text-align:left;padding:8px 12px;border-bottom:2px solid #e5e7eb;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280">${c.label}</th>`).join('')
  const body = rows
    .map(
      (r) => `<tr>${columns
        .map((c) => `<td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px">${c.render ? c.render(r) ?? '' : r[c.key] ?? ''}</td>`)
        .join('')}</tr>`,
    )
    .join('')
  win.document.write(`<!doctype html><html><head><title>${title}</title></head><body style="font-family:system-ui,sans-serif;padding:32px">
    <h1 style="font-size:20px;margin:0 0 4px">${title}</h1>
    <p style="font-size:12px;color:#6b7280;margin:0 0 24px">Generated on ${new Date().toLocaleString()}</p>
    <table style="border-collapse:collapse;width:100%">${head}<tbody>${body}</tbody></table>
    <script>window.print()</script></body></html>`)
  win.document.close()
}
