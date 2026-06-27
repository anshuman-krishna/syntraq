import { employeeModel } from '../models/employeeModel'
import { shiftModel } from '../models/shiftModel'
import { vehicleModel } from '../models/vehicleModel'
import { auditModel } from '../models/auditModel'

type Row = Record<string, unknown>

export type ExportEntity = 'shifts' | 'employees' | 'vehicles' | 'audit'
export type ExportFormat = 'csv' | 'json'

// fixed column order per entity so exports are stable regardless of row shape
const exporters: Record<ExportEntity, { columns: string[]; rows: (companyId: string) => Row[] }> = {
  shifts: {
    columns: ['id', 'employeeId', 'date', 'startTime', 'endTime', 'status', 'vehicleId', 'notes', 'createdAt'],
    rows: companyId => shiftModel.findAll(companyId),
  },
  employees: {
    columns: ['id', 'name', 'role', 'email', 'phone', 'hireDate', 'status', 'createdAt'],
    rows: companyId => employeeModel.findAll(companyId),
  },
  vehicles: {
    columns: ['id', 'name', 'plate', 'type', 'status', 'mileage', 'createdAt'],
    rows: companyId => vehicleModel.findAll(companyId),
  },
  audit: {
    columns: ['id', 'userId', 'action', 'entityType', 'entityId', 'createdAt'],
    rows: companyId => auditModel.findByCompany(companyId, 10000),
  },
}

function serializeValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function toCsv(columns: string[], rows: Row[]): string {
  const header = columns.join(',')
  const lines = rows.map(row =>
    columns.map(col => escapeCsv(serializeValue(row[col]))).join(','),
  )
  return [header, ...lines].join('\n')
}

export const exportService = {
  entities: Object.keys(exporters) as ExportEntity[],

  build(entity: ExportEntity, companyId: string, format: ExportFormat) {
    const exporter = exporters[entity]
    const rows = exporter.rows(companyId)
    const stamp = new Date().toISOString().slice(0, 10)

    if (format === 'json') {
      return {
        content: JSON.stringify(rows, null, 2),
        contentType: 'application/json',
        filename: `${entity}-${stamp}.json`,
      }
    }

    return {
      content: toCsv(exporter.columns, rows),
      contentType: 'text/csv',
      filename: `${entity}-${stamp}.csv`,
    }
  },
}
