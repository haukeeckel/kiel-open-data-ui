import { existsSync } from 'node:fs';
import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { chromium } from 'playwright';
import { sveltekit } from '@sveltejs/kit/vite';

const browserTestsRequested = process.env.VITEST_BROWSER !== 'false';

const isPlaywrightBrowserInstalled = (() => {
	if (!browserTestsRequested) return false;

	try {
		return existsSync(chromium.executablePath());
	} catch {
		return false;
	}
})();

const browserProjects = isPlaywrightBrowserInstalled
	? [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium' as const, headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			}
		]
	: [];

const globalScope = globalThis as typeof globalThis & {
	__vitestPlaywrightMissingWarningShown?: boolean;
};

if (browserTestsRequested && !isPlaywrightBrowserInstalled) {
	if (!globalScope.__vitestPlaywrightMissingWarningShown) {
		console.warn(
			'[vitest] Playwright Chromium is not installed; skipping browser tests. Run "pnpm exec playwright install" to enable them.'
		);
		globalScope.__vitestPlaywrightMissingWarningShown = true;
	}
}

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	test: {
		expect: { requireAssertions: true },
		projects: [
			...browserProjects,
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
