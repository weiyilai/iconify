import { promises as fs, Stats } from 'fs';
import { isPackageExists, importModule } from 'local-pkg';
import type { IconifyJSON } from '@iconify/types';
import { tryInstallPkg } from './install-pkg';
import type { AutoInstall } from './types';
import { resolvePath } from 'mlly';

const _collections: Record<string, Promise<IconifyJSON | undefined>> = {};
const isLegacyExists = isPackageExists('@iconify/json');

/**
 * Asynchronously loads a collection from the file system.
 *
 * @param name {string} the name of the collection, e.g. 'mdi'
 * @param autoInstall {AutoInstall} [autoInstall=false] - whether to automatically install
 * @param scope {string} [scope='@iconify-json'] - the scope of the collection, e.g. '@my-company-json'
 * @return {Promise<IconifyJSON | undefined>} the loaded IconifyJSON or undefined
 */
export async function loadCollectionFromFS(
	name: string,
	autoInstall: AutoInstall = false,
	scope = '@iconify-json',
	cwd = process.cwd()
): Promise<IconifyJSON | undefined> {
	if (!(await _collections[name])) {
		_collections[name] = task();
	}
	return _collections[name];

	async function task() {
		const packageName = scope.length === 0 ? name : `${scope}/${name}`;
		let jsonPath = await resolvePath(`${packageName}/icons.json`, {
			url: cwd,
		}).catch(() => undefined);

		// Legacy support for @iconify/json
		if (scope === '@iconify-json') {
			if (!jsonPath && isLegacyExists) {
				jsonPath = await resolvePath(
					`@iconify/json/json/${name}.json`,
					{
						url: cwd,
					}
				).catch(() => undefined);
			}

			// Try to install the package if it doesn't exist
			if (!jsonPath && !isLegacyExists && autoInstall) {
				await tryInstallPkg(packageName, autoInstall);
				jsonPath = await resolvePath(`${packageName}/icons.json`, {
					url: cwd,
				}).catch(() => undefined);
			}
		} else if (!jsonPath && autoInstall) {
			await tryInstallPkg(packageName, autoInstall);
			jsonPath = await resolvePath(`${packageName}/icons.json`, {
				url: cwd,
			}).catch(() => undefined);
		}

		// Try to import module if it exists
		if (!jsonPath) {
			let packagePath = await resolvePath(packageName, {
				url: cwd,
			}).catch(() => undefined);
			if (packagePath?.match(/^[a-z]:/i)) {
				packagePath = `file:///${packagePath}`.replace(/\\/g, '/');
			}
			if (packagePath) {
				const { icons }: { icons?: IconifyJSON } = await importModule(
					packagePath
				);
				if (icons) return icons;
			}
		}

		// Load from file
		let stat: Stats | undefined;
		try {
			stat = jsonPath ? await fs.lstat(jsonPath) : undefined;
		} catch (err) {
			return undefined;
		}
		if (stat?.isFile()) {
			return JSON.parse(
				await fs.readFile(jsonPath as string, 'utf8')
			) as IconifyJSON;
		} else {
			return undefined;
		}
	}
}
