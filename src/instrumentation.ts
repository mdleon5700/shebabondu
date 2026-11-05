/**
 * Server Lifecycle Instrumentation
 * Runs once when the Next.js Node.js server starts up.
 * Guarantees zero SSL aborts when communicating with Bangladesh government portals
 * and Teletalk subdomains (.gov.bd, .teletalk.com.bd) that have missing intermediate CAs.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
}
