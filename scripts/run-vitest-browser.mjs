import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const executablePath = chromium.executablePath();

if (!existsSync(executablePath)) {
	console.error('Playwright Chromium is not installed.');
	console.error('Run: pnpm exec playwright install');
	process.exit(1);
}

const result = spawnSync('pnpm', ['exec', 'vitest', '--run', '--project', 'client'], {
	stdio: 'inherit'
});

process.exit(result.status ?? 1);
