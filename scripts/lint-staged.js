const { execFileSync } = require('child_process');
const path = require('path');

const staged = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const unstaged = new Set(execFileSync('git', ['diff', '--name-only', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean));

// Formatters write whole files: never include unstaged hunks in the commit.
const partial = staged.filter((file) => /\.(js|json|md|ya?ml)$/.test(file) && unstaged.has(file));
if (partial.length) {
    throw new Error(`Partially staged files must be fully staged or unstaged before formatting: ${partial.join(', ')}`);
}

const files = staged.filter((file) => /\.(js|ya?ml)$/.test(file));
if (files.length) {
    const eslint = path.join(path.dirname(require.resolve('eslint/package.json')), 'bin/eslint.js');
    execFileSync(process.execPath, [eslint, '--fix', '--', ...files], { stdio: 'inherit' });
    execFileSync('git', ['add', '--', ...files], { stdio: 'inherit' });
}
