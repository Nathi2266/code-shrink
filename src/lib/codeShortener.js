/**
 * Client-side code shortening utilities
 * Performs: comment stripping + dead-code removal + minification
 */

/** Strip single-line and multi-line comments based on language */
function stripComments(code, language) {
  let result = code;
  const lang = language?.toLowerCase();

  // Strip multi-line block comments: /* ... */
  if (!['python', 'rb', 'ruby', 'sh', 'bash'].includes(lang)) {
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  // Strip Python/Ruby/Shell hash comments
  if (['python', 'rb', 'ruby', 'sh', 'bash'].includes(lang)) {
    result = result.replace(/(?:^|\n)[ \t]*#[^\n]*/g, '');
  } else {
    // Strip single-line // comments (not inside strings)
    result = result.replace(/(?<!["'`][^"'`]*)\/\/[^\n]*/g, '');
  }

  // Strip HTML comments
  if (['html', 'xml'].includes(lang)) {
    result = result.replace(/<!--[\s\S]*?-->/g, '');
  }

  // Strip CSS comments (already handled by /* */ above)
  return result;
}

/** Remove blank lines and trim trailing whitespace */
function removeBlankLines(code) {
  return code
    .split('\n')
    .map(line => line.trimEnd())
    .filter(line => line.trim() !== '')
    .join('\n');
}

/** Remove unused imports (JavaScript/TypeScript heuristic) */
function removeUnusedImports(code, language) {
  const lang = language?.toLowerCase();
  if (!['javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx'].includes(lang)) {
    return code;
  }

  const lines = code.split('\n');
  const nonImportCode = lines
    .filter(l => !l.trim().startsWith('import '))
    .join('\n');

  const importLines = lines.filter(l => l.trim().startsWith('import '));

  // Extract imported names
  const usedImports = importLines.filter(importLine => {
    // Extract what's being imported
    const match = importLine.match(/import\s+(?:\{([^}]+)\}|(\w+)|\*\s+as\s+(\w+))/);
    if (!match) return true; // keep if can't parse

    const names = (match[1] || match[2] || match[3] || '')
      .split(',')
      .map(n => n.trim().split(' as ').pop().trim())
      .filter(Boolean);

    if (names.length === 0) return true;

    // Check if any name is used in the non-import code
    return names.some(name => {
      const regex = new RegExp(`\\b${name}\\b`);
      return regex.test(nonImportCode);
    });
  });

  return [...usedImports, ...lines.filter(l => !l.trim().startsWith('import '))].join('\n');
}

/** Minify code: collapse whitespace, semicolons, etc. */
function minifyCode(code, language) {
  const lang = language?.toLowerCase();

  // For Python: preserve indentation but collapse multiple spaces
  if (['python'].includes(lang)) {
    return code
      .split('\n')
      .map(line => line.replace(/  +/g, ' '))
      .join('\n');
  }

  // For JS/TS: more aggressive minification
  if (['javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx'].includes(lang)) {
    return code
      .replace(/\s*([=+\-*/<>!&|?,;:{}()\[\]])\s*/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Generic: collapse multiple whitespace
  return code
    .split('\n')
    .map(line => line.replace(/\t/g, ' ').replace(/ {2,}/g, ' '))
    .join('\n');
}

/** Apply formatting options */
function applyFormatting(code, options) {
  const { indentation, lineEnding, style } = options;

  let result = code;

  // Replace indentation
  if (indentation === '2spaces') {
    result = result.replace(/\t/g, '  ');
    result = result.split('\n').map(line => {
      const match = line.match(/^( {4})+/);
      if (match) return line.replace(/    /g, '  ');
      return line;
    }).join('\n');
  } else if (indentation === '4spaces') {
    result = result.replace(/\t/g, '    ');
  } else if (indentation === 'tabs') {
    result = result.replace(/    /g, '\t').replace(/  /g, '\t');
  }

  // Line endings
  result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (lineEnding === 'crlf') {
    result = result.replace(/\n/g, '\r\n');
  }

  return result;
}

/**
 * Main shortening pipeline
 * Runs in chunks to avoid blocking UI thread
 */
export async function shortenCode(code, options = {}, onProgress) {
  const {
    language = 'javascript',
    removeComments = true,
    removeBlank = true,
    removeUnused = true,
    minify = false,
    formatting = { indentation: '2spaces', lineEnding: 'lf', style: 'compact' }
  } = options;

  let result = code;
  const steps = [];

  if (removeComments) steps.push({ fn: () => stripComments(result, language), label: 'Stripping comments...', weight: 25 });
  if (removeBlank) steps.push({ fn: () => removeBlankLines(result), label: 'Removing blank lines...', weight: 20 });
  if (removeUnused) steps.push({ fn: () => removeUnusedImports(result, language), label: 'Removing unused imports...', weight: 20 });
  if (minify) steps.push({ fn: () => minifyCode(result, language), label: 'Minifying...', weight: 25 });
  steps.push({ fn: () => applyFormatting(result, formatting), label: 'Applying formatting...', weight: 10 });

  let progress = 0;
  for (const step of steps) {
    onProgress?.(progress, step.label);
    // Yield to browser
    await new Promise(resolve => setTimeout(resolve, 0));
    result = step.fn();
    progress += step.weight;
    onProgress?.(Math.min(progress, 95), step.label);
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  onProgress?.(100, 'Done!');

  return {
    code: result,
    originalLines: code.split('\n').length,
    outputLines: result.split('\n').length,
    originalChars: code.length,
    outputChars: result.length,
  };
}

/** Calculate stats */
export function calcStats(original, output) {
  const linesSaved = original.split('\n').length - output.split('\n').length;
  const charsSaved = original.length - output.length;
  const reduction = original.length > 0
    ? Math.round((charsSaved / original.length) * 100)
    : 0;
  return { linesSaved, charsSaved, reduction };
}
