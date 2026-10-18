import { describe, it, expect } from 'vitest';
import { sanitizeHtml, escapeHtml } from './sanitize';

describe('Sanitize & Escape Utilities', () => {
  it('escapes dangerous HTML characters', () => {
    const raw = '<script>alert("xss")</script>';
    const escaped = escapeHtml(raw);
    expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
  });

  it('strips script and iframe tags in sanitizeHtml', () => {
    const malicious = '<p>Hello</p><script>alert("hack")</script><iframe src="evil.com"></iframe>';
    const clean = sanitizeHtml(malicious);
    expect(clean).toBe('<p>Hello</p>');
  });

  it('removes inline event handlers in sanitizeHtml', () => {
    const malicious = '<div onclick="stealTokens()">Click me</div>';
    const clean = sanitizeHtml(malicious);
    expect(clean).not.toContain('onclick');
    expect(clean).toContain('Click me');
  });

  it('handles empty or falsy inputs', () => {
    expect(escapeHtml('')).toBe('');
    expect(sanitizeHtml('')).toBe('');
  });
});
