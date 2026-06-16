import { TFile } from "obsidian";
import { getFolderSettings } from "src/utils/file-manipulation";
import { getGlobals } from "./stores";
import { StateSettings } from "src/types/types-map";
import { sanitizeInternalLinkName } from "src/utils/string-processes";

export type FileStateScope = 'standardNote' | 'projectPage';

export interface StateScopeSettings {
    visible: StateSettings[];
    hidden: StateSettings[];
    stateless: StateSettings;
    defaultState?: string;
    shouldLoopWhenCycling: boolean;
}

export function getStandardNoteStateSettings(): StateScopeSettings {
    const { plugin } = getGlobals();
    return {
        visible: plugin.settings.states.visible,
        hidden: plugin.settings.states.hidden,
        stateless: plugin.settings.stateless,
        defaultState: plugin.settings.defaultState,
        shouldLoopWhenCycling: plugin.settings.loopStatesWhenCycling,
    };
}

export function getProjectPageStateSettings(): StateScopeSettings {
    const { plugin } = getGlobals();
    return {
        visible: plugin.settings.projectPageStates.visible,
        hidden: plugin.settings.projectPageStates.hidden,
        stateless: plugin.settings.projectPageStateless,
        defaultState: plugin.settings.defaultProjectPageState,
        shouldLoopWhenCycling: plugin.settings.loopProjectPageStatesWhenCycling,
    };
}

export function getStateSettingsForScope(scope: FileStateScope): StateScopeSettings {
    return scope === 'projectPage'
        ? getProjectPageStateSettings()
        : getStandardNoteStateSettings();
}

export function getAllStateSettingsForScope(scope: FileStateScope): StateSettings[] {
    const scopedSettings = getStateSettingsForScope(scope);
    return [...scopedSettings.visible, ...scopedSettings.hidden];
}

export function getStateByNameForScope(stateName: string, scope: FileStateScope): StateSettings | null {
    const sanitizedStateName = sanitizeInternalLinkName(stateName);
    const allStateSettings = getAllStateSettingsForScope(scope);

    for (const stateSettings of allStateSettings) {
        if (stateSettings.name === sanitizedStateName) {
            return stateSettings;
        }
    }

    return null;
}

export async function isMarkdownFileInProject(file: TFile): Promise<boolean> {
    if (file.extension !== 'md') return false;
    const { plugin } = getGlobals();
    const parentFolder = file.parent ?? plugin.app.vault.getRoot();
    const folderSettings = await getFolderSettings(plugin.app.vault, parentFolder);
    return folderSettings.isProject === true;
}

export async function getFileStateScope(file: TFile): Promise<FileStateScope> {
    const isProjectPage = await isMarkdownFileInProject(file);
    return isProjectPage ? 'projectPage' : 'standardNote';
}

export async function getStateSettingsForFile(file: TFile): Promise<StateScopeSettings> {
    const scope = await getFileStateScope(file);
    return getStateSettingsForScope(scope);
}
