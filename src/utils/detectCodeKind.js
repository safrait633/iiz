// Утилита для определения типа кода по содержимому и расширению файла
// Возвращает { kind, ext, mime }

const EXT_MAP = {
  html: { kind: 'html', mime: 'text/html' },
  htm: { kind: 'html', mime: 'text/html' },
  css: { kind: 'css', mime: 'text/css' },
  js: { kind: 'javascript', mime: 'application/javascript' },
  mjs: { kind: 'javascript', mime: 'application/javascript' },
  cjs: { kind: 'javascript', mime: 'application/javascript' },
  ts: { kind: 'typescript', mime: 'text/plain' },
  jsx: { kind: 'jsx', mime: 'text/plain' },
  tsx: { kind: 'tsx', mime: 'text/plain' },
  json: { kind: 'json', mime: 'application/json' },
  xml: { kind: 'xml', mime: 'application/xml' },
  yml: { kind: 'yaml', mime: 'text/plain' },
  yaml: { kind: 'yaml', mime: 'text/plain' },
  md: { kind: 'markdown', mime: 'text/markdown' },
  py: { kind: 'python', mime: 'text/x-python' },
  java: { kind: 'java', mime: 'text/x-java' },
  cs: { kind: 'csharp', mime: 'text/plain' },
  cpp: { kind: 'cpp', mime: 'text/x-c' },
  c: { kind: 'c', mime: 'text/x-c' },
  php: { kind: 'php', mime: 'application/x-httpd-php' },
  rb: { kind: 'ruby', mime: 'text/plain' },
  sh: { kind: 'shell', mime: 'text/x-sh' }
};

function extFromFilename(name = '') {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
}

function detectByExtension(fileName) {
  const ext = extFromFilename(fileName);
  if (ext && EXT_MAP[ext]) return { ext, ...EXT_MAP[ext] };
  return null;
}

function detectByContent(content = '') {
  const text = content.trim();

  // Поиск код-блоков ```lang
  const fence = text.match(/```\s*([a-zA-Z0-9+#.-]*)\s*[\r\n]+([\s\S]*?)```/);
  if (fence) {
    const lang = fence[1].toLowerCase();
    const map = {
      html: 'html', xml: 'xml', js: 'javascript', javascript: 'javascript', ts: 'typescript',
      jsx: 'jsx', tsx: 'tsx', css: 'css', json: 'json', md: 'markdown', markdown: 'markdown',
      py: 'python', python: 'python', java: 'java', 'c#': 'csharp', csharp: 'csharp',
      cpp: 'cpp', c: 'c', php: 'php', ruby: 'ruby', rb: 'ruby', sh: 'shell', bash: 'shell', shell: 'shell'
    };
    const kind = map[lang] || 'text';
    const ext = Object.keys(EXT_MAP).find(e => EXT_MAP[e].kind === kind) || 'txt';
    const mime = EXT_MAP[ext]?.mime || 'text/plain';
    return { kind, ext, mime };
  }

  // Простые эвристики
  if (/<!DOCTYPE html>|<html[\s>]/i.test(text) || /<form[\s>]|<div[\s>]|<input[\s>]/i.test(text)) {
    return { kind: 'html', ext: 'html', mime: 'text/html' };
  }
  if (/^\s*\{|\}[\s]*$/.test(text) || /^[\s\r\n]*\{[\s\S]*\}[\s\r\n]*$/.test(text)) {
    try { JSON.parse(text); return { kind: 'json', ext: 'json', mime: 'application/json' }; } catch {}
  }
  if (/function\s+|=>|console\.|document\.|window\./.test(text)) {
    return { kind: 'javascript', ext: 'js', mime: 'application/javascript' };
  }
  if (/^\s*<\?xml\s/.test(text) || /<[^>]+>/i.test(text)) {
    return { kind: 'xml', ext: 'xml', mime: 'application/xml' };
  }
  if (/^\s*#include\b|\bint\s+main\s*\(/.test(text)) {
    return { kind: 'c', ext: 'c', mime: 'text/x-c' };
  }
  if (/^\s*import\s+|^\s*from\s+.*import\s+|def\s+|print\(/m.test(text)) {
    return { kind: 'python', ext: 'py', mime: 'text/x-python' };
  }
  if (/^\s*<\?php\b/.test(text)) {
    return { kind: 'php', ext: 'php', mime: 'application/x-httpd-php' };
  }
  if (/class\s+\w+\s*\{[\s\S]*\}|System\./.test(text)) {
    return { kind: 'csharp', ext: 'cs', mime: 'text/plain' };
  }
  if (/public\s+class\s+\w+|System\.out\.println/.test(text)) {
    return { kind: 'java', ext: 'java', mime: 'text/x-java' };
  }
  if (/^\s*#+\s|^\s*[-*]\s+|\[\w+\]\([^\)]+\)/m.test(text)) {
    return { kind: 'markdown', ext: 'md', mime: 'text/markdown' };
  }

  return { kind: 'text', ext: 'txt', mime: 'text/plain' };
}

export function detectCodeKind(content, fileName) {
  const byExt = detectByExtension(fileName);
  if (byExt) return byExt;
  return detectByContent(content);
}

export function suggestFileName(base = 'analysis', role = '', ext = 'txt') {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  const stamp = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  const rolePart = role ? `-${role}` : '';
  return `${base}${rolePart}-${stamp}.${ext}`;
}
