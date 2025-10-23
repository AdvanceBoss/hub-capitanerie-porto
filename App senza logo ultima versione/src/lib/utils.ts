import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function getRoleLabel(role: string): string {
  const labels = {
    maricogecap: 'MARICOGECAP',
    direzione_marittima: 'Direzione Marittima',
    capitaneria: 'Capitaneria di Porto',
    ufficio_circondariale: 'Ufficio Circondariale'
  }
  return labels[role as keyof typeof labels] || role
}

export function getRoleIcon(role: string): string {
  const icons = {
    maricogecap: '🏛️',
    direzione_marittima: '🏢',
    capitaneria: '⚓',
    ufficio_circondariale: '🏢'
  }
  return icons[role as keyof typeof icons] || '📋'
}

export function getStatusColor(status: string): string {
  const colors = {
    bozza: 'bg-gray-100 text-gray-800',
    inviato: 'bg-blue-100 text-blue-800',
    confermato: 'bg-green-100 text-green-800',
    archiviato: 'bg-purple-100 text-purple-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export function getStatusLabel(status: string): string {
  const labels = {
    bozza: 'Bozza',
    inviato: 'Inviato',
    confermato: 'Confermato',
    archiviato: 'Archiviato'
  }
  return labels[status as keyof typeof labels] || status
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function generateVerbaleNumber(organizationCode: string, year: number): string {
  const timestamp = Date.now().toString().slice(-6)
  return `${organizationCode}-${year}-${timestamp}`
}

export function validateCodiceFiscale(cf: string): boolean {
  if (!cf || cf.length !== 16) return false
  
  const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/
  return cfRegex.test(cf.toUpperCase())
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateIBAN(iban: string): boolean {
  const ibanRegex = /^IT[0-9]{2}[A-Z][0-9]{10}[0-9A-Z]{12}$/
  return ibanRegex.test(iban.replace(/\s/g, '').toUpperCase())
}
