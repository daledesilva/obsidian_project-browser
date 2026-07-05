import { TFile } from "obsidian";
import { getFileStateScope } from "src/logic/project-page-states";
import {
    getGlobals,
    getStateMenuSettings,
    getStateMenuSurfaceVisibility,
    setStateMenuSettings,
    setStateMenuSurfaceVisibility,
    StateMenuSurface,
} from "./stores";

//////////////////
//////////////////

export async function toggleStateMenu() {
    const {plugin} = getGlobals();
    const activeFile = plugin.app.workspace.getActiveFile();
    const surface = activeFile ? await getStateMenuSurfaceForFile(activeFile) : 'noteAndProject';
    toggleStateMenuSurface(surface);
}

export async function toggleStateMenuForFile(file: TFile) {
    const surface = await getStateMenuSurfaceForFile(file);
    toggleStateMenuSurface(surface);
}

export function toggleStateMenuSurface(surface: StateMenuSurface) {
    const {plugin} = getGlobals();
    const stateMenuSettings = getStateMenuSettings();
    const newStateMenuSettings = { ...stateMenuSettings };
    const nextVisible = !getStateMenuSurfaceVisibility(stateMenuSettings, surface);
    setStateMenuSurfaceVisibility(newStateMenuSettings, surface, nextVisible);
    setStateMenuSettings(newStateMenuSettings);

    if (surface === 'page') {
        plugin.settings.showPageStateMenu = nextVisible;
    } else {
        plugin.settings.showNoteAndProjectStateMenu = nextVisible;
        plugin.settings.showStateMenu = nextVisible;
    }
    void plugin.saveSettings();
}

export async function getStateMenuSurfaceForFile(file: TFile): Promise<StateMenuSurface> {
    const stateScope = await getFileStateScope(file);
    return stateScope === 'projectPage' ? 'page' : 'noteAndProject';
}

//////////////////

let cycleStateTimeout: NodeJS.Timeout | null = null;
let openedSurfaceByFunction: StateMenuSurface | null = null;

export function openStateMenuIfClosed(surface: StateMenuSurface = 'noteAndProject'): boolean {
    const curStateMenuSettings = getStateMenuSettings();
    if(getStateMenuSurfaceVisibility(curStateMenuSettings, surface)) return true;
    const newStateMenuSettings = { ...curStateMenuSettings };
    setStateMenuSurfaceVisibility(newStateMenuSettings, surface, true);
    setStateMenuSettings(newStateMenuSettings);
    openedSurfaceByFunction = surface;
    return false;
}

export function returnStateMenuAfterDelay(surface: StateMenuSurface = 'noteAndProject') {
    if(cycleStateTimeout) window.clearTimeout(cycleStateTimeout);
    cycleStateTimeout = window.setTimeout(() => {
        if(openedSurfaceByFunction !== surface) return;
        openedSurfaceByFunction = null;
        const curStateMenuSettings = getStateMenuSettings();
        const newStateMenuSettings = { ...curStateMenuSettings };
        setStateMenuSurfaceVisibility(newStateMenuSettings, surface, false);
        setStateMenuSettings(newStateMenuSettings);
    }, 1000);
}

