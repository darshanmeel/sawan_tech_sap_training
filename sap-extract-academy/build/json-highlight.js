// Zero-dep JSON syntax-highlighter for the Columns JSON view.
//
// Emits a <pre>-ready string where strings / numbers / booleans / null / keys
// are wrapped in <span class="s">, <span class="n">, <span class="k">,
// <span class="p"> respectively. Matches the span class names in the
// reference mockup docs/design/directory-final.html so Worker D's CSS wires
// up without further coordination.
//
// Not a general-purpose highlighter; good enough for the small, well-formed
// objects we emit from known-safe data at build time.

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Stringify `obj` as pretty-printed JSON, then wrap tokens in spans.
 *
 * Class-name contract (matches docs/design/directory-final.html):
 *   k = keyword (true / false / null)
 *   s = string literal (both keys and string values)
 *   n = number
 *   p = punctuation/separator (reserved — currently unused)
 *   c = comment (reserved — currently unused)
 *
 * @param {any} obj
 * @param {number} [indent=2]
 * @returns {string} HTML string, safe to drop into a <pre> with {{{triple}}}.
 */
export function highlightJson(obj, indent = 2) {
  const json = JSON.stringify(obj, null, indent);
  // Tokenise: strings (with possible key suffix ":"), numbers, keywords.
  const tokenRe =
    /("(?:\\.|[^"\\])*")(\s*:)?|(\b-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)/g;

  return escapeHtml(json).replace(tokenRe, (m, strWithQuotes, colon, num, kw) => {
    if (strWithQuotes !== undefined) {
      return `<span class="s">${strWithQuotes}</span>${colon || ''}`;
    }
    if (num !== undefined) {
      return `<span class="n">${num}</span>`;
    }
    if (kw !== undefined) {
      return `<span class="k">${kw}</span>`;
    }
    return m;
  });
}

export default highlightJson;
