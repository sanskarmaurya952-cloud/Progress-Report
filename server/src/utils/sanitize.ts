/**
 * HTML Sanitization and escaping utilities.
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escapes all HTML special characters into their safe entity equivalents.
 */
export function escapeHtml(input: string): string {
  if (!input) return '';
  return String(input).replace(/[&<>"'`=\/]/g, (char) => HTML_ENTITY_MAP[char] || char);
}

/**
 * Strips potentially dangerous tags (script, style, iframe, object, embed, etc.)
 * and dangerous event attributes (onclick, onerror, javascript:), while keeping safe basic formatting tags.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';

  let sanitized = String(input);

  // Remove dangerous tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');

  // Strip event handler attributes like onclick="...", onload="...", onmouseover="..."
  sanitized = sanitized.replace(/\s*on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // Strip javascript: URLs in href/src
  sanitized = sanitized.replace(/(href|src)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, '$1="#"');

  return sanitized.trim();
}
