import { App } from 'obsidian';
import {
	HIDDEN_USER_IGNORE_FILTER,
	LEGACY_HIDDEN_USER_IGNORE_FILTERS,
	STATE_HIDE_USER_IGNORE_FILTER,
} from './filename-suffixes';

//////////////////
//////////////////

type VaultWithUserIgnoreConfig = {
	getConfig?: (key: string) => unknown;
	setConfig?: (key: string, value: unknown) => void;
	trigger?: (name: string, ...data: unknown[]) => void;
};

/**
 * Reads Obsidian's native Excluded files list (`userIgnoreFilters`).
 * Uses undocumented vault config APIs — the only way plugins can manage this list.
 */
export function getUserIgnoreFilters(app: App): string[] {
	const vault = app.vault as unknown as VaultWithUserIgnoreConfig;
	if (typeof vault.getConfig !== 'function') {
		return [];
	}
	const raw = vault.getConfig('userIgnoreFilters');
	if (!Array.isArray(raw)) {
		return [];
	}
	return raw.filter((entry): entry is string => typeof entry === 'string');
}

/**
 * Nudges settings UI and other config consumers after we mutate Excluded files.
 * Obsidian 1.13+ listeners key off the changed config name (`userIgnoreFilters`).
 * Only call when the list actually changed — re-firing on no-op would be pointless noise.
 */
function notifyUserIgnoreFiltersChanged(vault: VaultWithUserIgnoreConfig): void {
	if (typeof vault.trigger === 'function') {
		vault.trigger('config-changed', 'userIgnoreFilters');
	}
}

/**
 * Adds a filter substring to Obsidian's Excluded files list without replacing existing
 * user entries, and without re-adding a filter that is already present.
 */
export function ensureUserIgnoreFilter(app: App, filterSubstring: string): boolean {
	const vault = app.vault as unknown as VaultWithUserIgnoreConfig;
	if (typeof vault.getConfig !== 'function' || typeof vault.setConfig !== 'function') {
		return false;
	}

	const existing = getUserIgnoreFilters(app);
	// Exact match only — substring includes would treat `/\[HIDDEN\]/` as already present when
	// the narrower legacy `/\[HIDDEN\]\.md/` remains, blocking migration to the broader filter.
	const alreadyPresent = existing.some((entry) => entry === filterSubstring);
	if (alreadyPresent) {
		return false;
	}

	vault.setConfig('userIgnoreFilters', [...existing, filterSubstring]);
	notifyUserIgnoreFiltersChanged(vault);
	return true;
}

/**
 * Removes a previously injected filter when the plugin no longer needs it (e.g. draft hide
 * toggled off). Only removes exact matches so user-authored filters stay intact.
 */
export function removeUserIgnoreFilter(app: App, filterSubstring: string): boolean {
	const vault = app.vault as unknown as VaultWithUserIgnoreConfig;
	if (typeof vault.getConfig !== 'function' || typeof vault.setConfig !== 'function') {
		return false;
	}

	const existing = getUserIgnoreFilters(app);
	const next = existing.filter((entry) => entry !== filterSubstring);
	if (next.length === existing.length) {
		return false;
	}

	vault.setConfig('userIgnoreFilters', next);
	notifyUserIgnoreFiltersChanged(vault);
	return true;
}

/**
 * Ensures manual `[HIDDEN]` and state `[STATE-HIDE]` paths are excluded from search/graph
 * via unanchored path regexes, without overwriting unrelated user filters.
 */
export function ensureHiddenMarkdownIgnoreFilter(app: App): void {
	// Drop superseded filters (plain and md-only regex) before ensuring the current pattern.
	for (const legacyFilter of LEGACY_HIDDEN_USER_IGNORE_FILTERS) {
		removeUserIgnoreFilter(app, legacyFilter);
	}
	ensureUserIgnoreFilter(app, HIDDEN_USER_IGNORE_FILTER);
	ensureUserIgnoreFilter(app, STATE_HIDE_USER_IGNORE_FILTER);
}
