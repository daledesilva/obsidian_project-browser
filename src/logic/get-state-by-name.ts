import { getGlobals } from "./stores";
import { PluginStateSettings_0_1_0 } from "src/types/plugin-settings0_1_0";
import { sanitizeInternalLinkName } from "src/utils/string-processes";

//////////////////
//////////////////

export function getStateByName(stateName: string): PluginStateSettings_0_1_0 | null {
    const { plugin } = getGlobals();
    const allStateSettings = [...plugin.settings.states.visible, ...plugin.settings.states.hidden];

    const sanitizedStateName = sanitizeInternalLinkName(stateName);

    for (const stateSettings of allStateSettings) {
        if (stateSettings.name === sanitizedStateName) {
            return stateSettings;
        }
    }

    return null;
}
