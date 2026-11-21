/**
 * Read a font family from a CSS custom property set by next/font
 * (e.g. `--font-bricolage`), with a safe fallback.
 * @param {string} variable
 * @param {string} [fallback]
 */
export function readFontFamily(variable, fallback = "system-ui, sans-serif") {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value ? `${value}, ${fallback}` : fallback;
}

/**
 * Wait until a font is ready for canvas drawing, without blocking forever.
 * @param {string} family
 * @param {number} timeoutMs
 */
export async function waitForFont(family, timeoutMs) {
  if (!document.fonts?.load) return;
  const timeout = new Promise((resolve) => setTimeout(resolve, timeoutMs));
  try {
    await Promise.race([document.fonts.load(`700 64px ${family}`), timeout]);
  } catch {
    // Drawing falls back to the next family in the stack.
  }
}
