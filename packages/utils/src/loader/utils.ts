import { installPackage } from '@antfu/install-pkg';
import { sleep } from '@antfu/utils';
import { cyan, yellow } from 'kolorist'

export function camelize(str: string): string {
	return str.replace(/-([a-z0-9])/g, g => g[1].toUpperCase());
}

export function pascalize(str: string): string {
	const camel = camelize(str);
	return `${camel[0].toUpperCase()}${camel.slice(1)}`;
}

export function camelToKebab(key: string): string {
	const result = key
		.replace(/:/g, '-')
		.replace(/([A-Z])/g, ' $1')
		.trim();
	return result.split(/\s+/g).join('-').toLowerCase();
}

const warned = new Set<string>();

export function warnOnce(msg: string): void {
	if (!warned.has(msg)) {
		warned.add(msg);
		console.warn(yellow(`[@iconify-loader] ${msg}`));
	}
}


let pending: Promise<void> | undefined;
const tasks: Record<string, Promise<void> | undefined> = {};

export async function tryInstallPkg(name: string): Promise<void | undefined> {
	if (pending) {
		await pending;
	}

	if (!tasks[name]) {
		// eslint-disable-next-line no-console
		console.log(cyan(`Installing ${name}...`))
		tasks[name] = pending = installPackage(name, { dev: true, preferOffline: true })
			.then(() => sleep(300))
			// eslint-disable-next-line
			.catch((e: any) => {
				warnOnce(`Failed to install ${name}`);
				console.error(e);
			})
			.finally(() => {
				pending = undefined;
			});
	}

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return tasks[name]!;
}
