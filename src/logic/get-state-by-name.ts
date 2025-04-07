import { getGlobals } from "./stores";
import { PluginStateSettings } from "src/types/types-map";
import { sanitizeInternalLinkName } from "src/utils/string-processes";

//////////////////
//////////////////

export function getStateByName(stateName: string): PluginStateSettings | null {
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
