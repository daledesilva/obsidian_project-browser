import type { App } from 'obsidian';
import { getGlobals } from './stores';

///////////
///////////

/** Minimal fallback when viewRegistry is inaccessible. */
const REGISTRY_FALLBACK_EXTENSIONS = new Set(['md', 'canvas', 'base']);

function getRegisteredExtensionsFromApp(app: App): Set<string> {
    try {
        const appWithRegistry = app as {
            viewRegistry?: { typeByExtension?: Record<string, unknown>; typeByExt?: Record<string, unknown> };
            workspace?: { viewRegistry?: { typeByExtension?: Record<string, unknown>; typeByExt?: Record<string, unknown> } };
        };
        const registry = appWithRegistry.viewRegistry ?? appWithRegistry.workspace?.viewRegistry;
        if (!registry) return new Set([...REGISTRY_FALLBACK_EXTENSIONS]);
        const typeByExtension = registry.typeByExtension ?? registry.typeByExt ?? {};
        const keys = Object.keys(typeByExtension);
        const result = new Set(keys.map((k) => k.toLowerCase()).filter((k) => k && k !== 'pbs'));
        if (result.size === 0) return new Set([...REGISTRY_FALLBACK_EXTENSIONS]);
        return result;
    } catch {
        return new Set([...REGISTRY_FALLBACK_EXTENSIONS]);
    }
}

/**
 * Returns true if the given extension is not supported by Obsidian (not in the view registry).
 * Such files open in the system default application rather than inside Obsidian.
 */
export function isExtensionUnsupportedByObsidian(extension: string): boolean {
    const normalizedExt = (extension ?? '').toLowerCase();
    if (!normalizedExt) return false;

    const { plugin } = getGlobals();
    const registeredExtensions = getRegisteredExtensionsFromApp(plugin.app);
    return !registeredExtensions.has(normalizedExt);
}
