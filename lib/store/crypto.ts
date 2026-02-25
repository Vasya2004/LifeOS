// ============================================
// CRYPTO INFRASTRUCTURE — AES-GCM 256-bit
// Uses Web Crypto API (native browser, zero deps)
//
// STATUS: Infrastructure only — NOT wired into storage yet.
// To enable: pass encryptionKey to StorageProvider and
// call encryptValue/decryptValue around sensitive keys.
//
// Usage flow (future):
//   1. User sets PIN in settings
//   2. deriveKeyFromPin(pin, salt) → CryptoKey
//   3. On write: if isSensitiveKey(key) → encryptValue(cryptoKey, data)
//   4. On read:  if isSensitiveKey(key) → decryptValue(cryptoKey, stored)
// ============================================

/**
 * Keys that contain sensitive personal data.
 * These should be encrypted when encryption is enabled.
 */
export const SENSITIVE_KEYS: ReadonlySet<string> = new Set([
  "transactions",
  "accounts",
  "financialGoals",
  "budgets",
  "medicalDocuments",
  "healthMetrics",
  "healthProfile",
  "journal",
  "dailyReviews",
  "weeklyReviews",
])

/**
 * Whether a store key is considered sensitive.
 */
export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key)
}

// ── Key Derivation ────────────────────────────────────────────────

/**
 * Generate a cryptographically random salt (16 bytes).
 * Store this salt alongside encrypted data.
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16))
}

/**
 * Derive a 256-bit AES-GCM encryption key from a PIN
 * using PBKDF2 with 100,000 iterations.
 *
 * @param pin - User's PIN or passphrase
 * @param salt - Random salt (must be stored, needed for decryption)
 */
export async function deriveKeyFromPin(
  pin: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"]
  )

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

// ── Encryption / Decryption ───────────────────────────────────────

/**
 * Encrypt any value using AES-GCM 256-bit.
 * Returns a base64-encoded string: [12-byte IV] + [ciphertext]
 */
export async function encryptValue(
  key: CryptoKey,
  data: unknown
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(JSON.stringify(data))

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  )

  // Combine iv + ciphertext into single Uint8Array
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), iv.byteLength)

  // Return as base64
  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypt a base64-encoded AES-GCM ciphertext.
 * Returns the original value.
 */
export async function decryptValue(
  key: CryptoKey,
  encryptedBase64: string
): Promise<unknown> {
  const combined = Uint8Array.from(atob(encryptedBase64), (c) =>
    c.charCodeAt(0)
  )

  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  )

  return JSON.parse(new TextDecoder().decode(decrypted))
}

// ── PIN Validation ────────────────────────────────────────────────

/**
 * Validate a PIN meets minimum requirements.
 */
export function validatePin(pin: string): { valid: boolean; error?: string } {
  if (pin.length < 4) return { valid: false, error: "PIN должен быть не менее 4 символов" }
  if (pin.length > 32) return { valid: false, error: "PIN не должен превышать 32 символа" }
  return { valid: true }
}

// ── Marker for encrypted values ───────────────────────────────────

const ENCRYPTED_MARKER = "__enc__:"

/**
 * Wrap encrypted base64 with a recognizable marker.
 * Allows storage layer to detect which values need decryption.
 */
export function markEncrypted(base64: string): string {
  return `${ENCRYPTED_MARKER}${base64}`
}

/**
 * Check if a stored value is encrypted.
 */
export function isEncrypted(value: unknown): boolean {
  return typeof value === "string" && value.startsWith(ENCRYPTED_MARKER)
}

/**
 * Strip the encryption marker and return the raw base64.
 */
export function stripMarker(value: string): string {
  return value.slice(ENCRYPTED_MARKER.length)
}
