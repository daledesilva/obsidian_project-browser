import { LOCAL_STORAGE_PREFIX } from "src/constants";
import { WritableAtom, atom, createStore } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import ProjectBrowserPlugin from "src/main";

/////////
/////////

interface Globals {
	plugin: ProjectBrowserPlugin,
}
export const globalsAtom = atom<Globals>()
export const globalsStore = createStore();
export function setGlobals(globals: Globals): void {
	globalsStore.set(globalsAtom, globals);
}
export function getGlobals(): Globals {
	const globals = globalsStore.get(globalsAtom);
	if(!globals) {
		throw new Error(`Project Browser plugin globals isn't available yet`);
	}
	return globals;
}

//////////
//////////

export const deviceMemoryStore = createStore();
export const showHiddenFoldersAtom = atomWithStorage(LOCAL_STORAGE_PREFIX + 'show-hidden-folders', false)

export function hideHiddenFolders() {
    deviceMemoryStore.set(showHiddenFoldersAtom, false);
}
export function unhideHiddenFolders() {
    deviceMemoryStore.set(showHiddenFoldersAtom, true);
}
/***
 * Fetch the current state of the showHiddenFolders Atom.
 * Use 'useAtomValue(showHiddenFoldersAtom) in React instead.
 */
export function getShowHiddenFolders(): boolean {
    return deviceMemoryStore.get(showHiddenFoldersAtom);
}

