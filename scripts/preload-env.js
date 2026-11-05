/**
 * Preload script executed before Node starts Next.js.
 * Ensures Node.js and internal TLS connectors (undici/fetch/https) accept
 * Bangladesh government portals (.gov.bd, .teletalk.com.bd) without aborting
 * on missing intermediate certificate authority chains.
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

