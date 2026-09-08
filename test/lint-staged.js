const { execFileSync } = require('child_process');
const path = require('path');

jest.mock('child_process', () => ({ execFileSync: jest.fn() }));

const run = (staged, unstaged = '') => {
    execFileSync.mockReturnValueOnce(staged).mockReturnValueOnce(unstaged);
    jest.isolateModules(() => require('../scripts/lint-staged'));
};

beforeEach(() => execFileSync.mockReset());

it('lints only staged JS and YAML and preserves paths containing spaces', () => {
    run('lib/a b.js\0.github/test.yaml\0docs/a.md\0', 'lib/unrelated.js\0');
    expect(execFileSync).toHaveBeenNthCalledWith(1, 'git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'], { encoding: 'utf8' });
    const eslint = path.join(path.dirname(require.resolve('eslint/package.json')), 'bin/eslint.js');
    expect(execFileSync).toHaveBeenNthCalledWith(3, process.execPath, [eslint, '--fix', '--', 'lib/a b.js', '.github/test.yaml'], { stdio: 'inherit' });
    expect(execFileSync).toHaveBeenNthCalledWith(4, 'git', ['add', '--', 'lib/a b.js', '.github/test.yaml'], { stdio: 'inherit' });
});

it.each(['', 'docs/a.md\0'])('does not fall back to repository-wide lint for %j', (staged) => {
    run(staged);
    expect(execFileSync).toHaveBeenCalledTimes(2);
});

it.each(['lib/a.js', 'docs/a.md', 'package.json'])('rejects partial staging before formatting %s', (file) => {
    expect(() => run(`${file}\0`, `${file}\0`)).toThrow('Partially staged');
    expect(execFileSync).toHaveBeenCalledTimes(2);
});

it('propagates lint failure without restaging files', () => {
    execFileSync
        .mockReturnValueOnce('lib/a.js\0')
        .mockReturnValueOnce('')
        .mockImplementationOnce(() => {
            throw new Error('lint failed');
        });
    expect(() => jest.isolateModules(() => require('../scripts/lint-staged'))).toThrow('lint failed');
    expect(execFileSync).toHaveBeenCalledTimes(3);
});
