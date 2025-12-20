// Types for Firebase timestamps
interface FirebaseTimestamp {
  toDate(): Date
  seconds?: number
}

type DateInput = Date | FirebaseTimestamp | { seconds: number } | string | number

// Format price in RSD
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

// Format date
export function formatDate(timestamp: DateInput | null | undefined): string {
  if (!timestamp) return 'N/A'
  
  let date: Date
  if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
    date = timestamp.toDate()
  } else if (typeof timestamp === 'object' && 'seconds' in timestamp && typeof timestamp.seconds === 'number') {
    date = new Date(timestamp.seconds * 1000)
  } else {
    date = new Date(timestamp as string | number | Date)
  }
  
  return date.toLocaleDateString('sr-RS', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}
