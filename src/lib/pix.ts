/**
 * PIX QR Code Generator
 * Implements Brazilian PIX standard for static QR codes
 */

export interface PixData {
  key: string           // PIX key (CPF, CNPJ, email, phone)
  amount?: number       // Amount in reais (optional)
  description?: string  // Payment description
  merchantName: string  // Name of recipient
  merchantCity: string  // City of recipient
}

/**
 * Generates a PIX payload (copy-paste code) following BACEN standards
 * This is NOT a dynamic QR, but a static one that can be generated client-side
 */
export function generatePixPayload(data: PixData): string {
  const { key, amount, description, merchantName, merchantCity } = data
  
  // EMV QR Code Standard for PIX
  const payload = buildPixPayload({
    key,
    amount: amount?.toFixed(2),
    description,
    merchantName,
    merchantCity
  })
  
  return payload
}

/**
 * Generates a QR Code data URL from PIX payload
 * Uses a free QR code API (can be replaced with local library)
 */
export function getPixQrCodeUrl(payload: string, size: number = 300): string {
  // Using QRServer API (free, no key required for basic usage)
  // In production, use a local QR library like qrcode.react
  const encoded = encodeURIComponent(payload)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`
}

// Helper function to build PIX payload according to EMV standard
function buildPixPayload(data: {
  key: string
  amount?: string
  description?: string
  merchantName: string
  merchantCity: string
}): string {
  const { key, amount, description, merchantName, merchantCity } = data
  
  // EMV QR Code fields
  const idPayloadFormat = '01' // Payload Format Indicator
  const idMerchantAccount = '26' // Merchant Account Information (GUI + PIX key)
  const idMerchantCategory = '52' // Merchant Category Code (default: 0000)
  const idTransactionCurrency = '53' // Transaction Currency (986 = BRL)
  const idCountryCode = '58' // Country Code (BR)
  const idMerchantName = '59' // Merchant Name
  const idMerchantCity = '60' // Merchant City
  const idAdditionalData = '62' // Additional Data Field Template (TXID)
  const idCRC16 = '63' // CRC16-CCITT
  
  // Build Merchant Account Information
  const gui = 'br.gov.bcb.pix'
  const merchantAccount = 
    '00' + String(gui.length).padStart(2, '0') + gui +
    '01' + String(key.length).padStart(2, '0') + key
  
  let payload = 
    idPayloadFormat + '02' + '01' + // Payload Format: 01
    idMerchantAccount + String(merchantAccount.length).padStart(2, '0') + merchantAccount
  
  // Add amount if provided
  if (amount) {
    const amountField = idTransactionCurrency + '03' + '986' +
                        '54' + String(amount.length).padStart(2, '0') + amount
    payload += amountField
  } else {
    payload += idTransactionCurrency + '03' + '986'
  }
  
  // Add country code
  payload += idCountryCode + '02' + 'BR'
  
  // Add merchant name (max 25 chars)
  const name = merchantName.substring(0, 25)
  payload += idMerchantName + String(name.length).padStart(2, '0') + name
  
  // Add merchant city (max 15 chars)
  const city = merchantCity.substring(0, 15)
  payload += idMerchantCity + String(city.length).padStart(2, '0') + city
  
  // Add additional data (TXID)
  const txid = '***' // Static TXID
  const additionalData = '05' + String(txid.length).padStart(2, '0') + txid
  payload += idAdditionalData + String(additionalData.length).padStart(2, '0') + additionalData
  
  // Calculate and add CRC16
  payload += idCRC16 + '04'
  const crc = calculateCRC16(payload)
  payload += crc
  
  return payload
}

// CRC16-CCITT calculation for PIX
function calculateCRC16(payload: string): string {
  let crc = 0xFFFF
  const polynomial = 0x1021
  
  for (let i = 0; i < payload.length; i++) {
    crc ^= (payload.charCodeAt(i) << 8)
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial
      } else {
        crc = crc << 1
      }
      crc &= 0xFFFF
    }
  }
  
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/**
 * Validates a PIX key
 */
export function isValidPixKey(key: string): boolean {
  if (!key) return false
  
  // Remove spaces and special characters for validation
  const clean = key.replace(/[\s\.\-]/g, '')
  
  // CPF: 11 digits
  if (/^\d{11}$/.test(clean)) return true
  
  // CNPJ: 14 digits
  if (/^\d{14}$/.test(clean)) return true
  
  // Email: basic validation
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) return true
  
  // Phone: +55 + 11 digits
  if (/^\+?55\d{11}$/.test(clean)) return true
  
  // Random key (UUID format): 36 chars
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) return true
  
  return false
}

/**
 * Formats PIX key for display
 */
export function formatPixKey(key: string): string {
  const clean = key.replace(/[\s\.\-]/g, '')
  
  // Format CPF: XXX.XXX.XXX-XX
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  
  // Format CNPJ: XX.XXX.XXX/XXXX-XX
  if (clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  
  // Format phone: +55 (XX) XXXXX-XXXX
  if (clean.length === 13 && clean.startsWith('55')) {
    return clean.replace(/55(\d{2})(\d{5})(\d{4})/, '+55 ($1) $2-$3')
  }
  
  return key
}
