const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');

const exts = ['.js', '.jsx', '.ts', '.tsx'];

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (file === 'node_modules' || file === 'build') return;
      walk(full, fileList);
    } else if (exts.includes(path.extname(full))) {
      fileList.push(full);
    }
  });
  return fileList;
}

function parseImports(file) {
  const content = fs.readFileSync(file, 'utf8');
  const importRegex = /import\s+(?:[^'";]+from\s+)?["'](.+?)["']/g;
  const requiresRegex = /require\(["'](.+?)["']\)/g;
  const res = [];
  let m;
  while ((m = importRegex.exec(content))) res.push(m[1]);
  while ((m = requiresRegex.exec(content))) res.push(m[1]);
  return res;
}

function resolveImport(importPath, fromFile) {
  if (importPath.startsWith('.')) {
    const base = path.resolve(path.dirname(fromFile), importPath);
    for (const ext of exts) {
      if (fs.existsSync(base + ext)) return base + ext;
    }
    if (fs.existsSync(base) && fs.statSync(base).isDirectory()) {
      for (const ext of exts) {
        const idx = path.join(base, 'index' + ext);
        if (fs.existsSync(idx)) return idx;
      }
    }
    return null;
  }
  return null; // ignore node_modules and package imports
}

const files = walk(srcDir);
const incoming = {};
files.forEach(f => incoming[f] = new Set());

files.forEach(f => {
  const imports = parseImports(f);
  imports.forEach(i => {
    const resolved = resolveImport(i, f);
    if (resolved && incoming[resolved]) {
      incoming[resolved].add(f);
    }
  });
});

// Consider entry points as used
const entryPoints = [
  path.join(srcDir, 'index.js'),
  path.join(srcDir, 'App.js')
];

const unused = [];
Object.keys(incoming).forEach(file => {
  if (incoming[file].size === 0 && !entryPoints.includes(file)) {
    unused.push(file);
  }
});

console.log('Scanned files:', files.length);
console.log('Unused files (no incoming imports):');
unused.forEach(f => console.log('-', path.relative(root, f)));
console.log('\nNote: This is a heuristic. Files referenced dynamically or via other means may be false positives.');
