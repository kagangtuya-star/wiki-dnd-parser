const path = require('path');
const { execSync } = require('child_process');

const repoDir = path.resolve(__dirname, 'input/5e-cn/homebrew');
const targetDir = path.resolve(__dirname, 'input');
const OUTPUT = path.join(targetDir, 'replace-logs-homebrew-zh.json');
const locale = 'zh';
const HOMEBREW_SKIP_DIRS = ['_img', '.github', '_test', '_node', '_font', '_doc', '.github'];

const getTimestamp = () => new Date().toLocaleTimeString();
const getCommitInfo = (commitHash, cwd) => {
    try {
        const r = execSync("git show -s --format=%H||%s||%an||%ai " + commitHash, { cwd, encoding: 'utf8' }).trim();
        const [hash, message, author, date] = r.split('||');
        return { hash: (hash||'').trim(), message: (message||'').trim(), author: (author||'').trim(), date: (date||'').trim() };
    } catch {
        return { hash: commitHash, message: 'Unknown', author: 'Unknown', date: 'Unknown' };
    }
};

const main = async () => {
    console.log('[' + getTimestamp() + '] Start manual zh homebrew replace-logs at ' + repoDir);
    
    let latest, prev;
    try {
        latest = execSync('git rev-parse HEAD', { cwd: repoDir, encoding: 'utf8' }).trim();
        console.log('[' + getTimestamp() + '] HEAD = ' + latest);
    } catch (e) {
        throw new Error('git rev-parse HEAD FAILED: ' + e.message);
    }
    try {
        prev = execSync('git rev-parse HEAD~1', { cwd: repoDir, encoding: 'utf8' }).trim();
        console.log('[' + getTimestamp() + '] HEAD~1 = ' + prev);
    } catch (e) {
        throw new Error('git rev-parse HEAD~1 FAILED: ' + e.message);
    }

    let diff;
    try {
        diff = execSync(`git diff ${prev} ${latest} --name-status`, { cwd: repoDir, encoding: 'utf8' });
    } catch (e) {
        throw new Error('git diff FAILED: ' + e.message);
    }
    const lines = diff.trim().split('\n');
    console.log('[' + getTimestamp() + '] diff lines: ' + lines.length);

    let kept = 0, skipped = 0;
    for (const line of lines) {
        const parts = line.split('\t');
        const status = parts[0];
        const filePath = parts[1];
        if (!filePath) continue;
        const skip = HOMEBREW_SKIP_DIRS.some(d => filePath.startsWith(d + '/') || filePath.includes('/' + d + '/'));
        if (skip) { skipped++; continue; }
        if (!filePath.endsWith('.json')) { skipped++; continue; }
        kept++;
        if (kept <= 5) console.log('  KEEP: ' + status + ' | ' + filePath);
    }
    console.log('[' + getTimestamp() + '] summary: kept=' + kept + ', skipped=' + skipped);

    const ci = getCommitInfo(latest, repoDir);
    const cp = getCommitInfo(prev, repoDir);
    console.log('[' + getTimestamp() + '] commit info: latest=' + ci.message + ', prev=' + cp.message);
    console.log('[' + getTimestamp() + '] SUCCESS');
};
main().catch(e => {
    console.error('ERR: ' + e.message);
    console.error('STACK: ' + (e.stack || '(none)'));
    process.exit(1);
});
