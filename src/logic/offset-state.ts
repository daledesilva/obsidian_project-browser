import { TFile, TFolder } from "obsidian";
import { getFileStateSettingsAsync } from "./frontmatter-processes";
import { StateSettings } from "src/types/types-map";
import { getStandardNoteStateSettings, getStateSettingsForFile } from "./project-page-states";
import { getFolderStateName } from "src/utils/file-manipulation";

//////////////////
//////////////////

function offsetWithinStateList(
    currentStateName: string | null,
    allStateSettings: StateSettings[],
    offset: number,
    cycle: boolean,
): StateSettings {
    if (currentStateName) {
        const curStateIndex = allStateSettings.findIndex((state) => state.name === currentStateName);
        let newStateIndex = curStateIndex + offset;
        if (cycle) {
            if (newStateIndex < 0) newStateIndex = allStateSettings.length - 1;
            if (newStateIndex >= allStateSettings.length) newStateIndex = 0;
        }
        newStateIndex = Math.max(0, newStateIndex);
        newStateIndex = Math.min(allStateSettings.length - 1, newStateIndex);
        return allStateSettings[newStateIndex];
    }

    if (offset > 0) {
        return allStateSettings[0];
    }
    return allStateSettings[allStateSettings.length - 1];
}

export async function offsetState(file: TFile, offset: number, cycle: boolean = false): Promise<StateSettings> {
    const curStateSettings = await getFileStateSettingsAsync(file);
    const scopedStateSettings = await getStateSettingsForFile(file);
    const allStateSettings = [...scopedStateSettings.visible, ...scopedStateSettings.hidden];
    return offsetWithinStateList(curStateSettings?.name ?? null, allStateSettings, offset, cycle);
}

/** Project-root folders use note/project states (not page states). */
export async function offsetFolderState(folder: TFolder, offset: number, cycle: boolean = false): Promise<StateSettings> {
    const currentStateName = await getFolderStateName(folder);
    const scopedStateSettings = getStandardNoteStateSettings();
    const allStateSettings = [...scopedStateSettings.visible, ...scopedStateSettings.hidden];
    return offsetWithinStateList(currentStateName, allStateSettings, offset, cycle);
}
