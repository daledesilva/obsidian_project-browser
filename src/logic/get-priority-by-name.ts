import { getGlobals } from "./stores";
import { PrioritySettings } from "src/types/types-map";
import { sanitizeInternalLinkName } from "src/utils/string-processes";

//////////////////
//////////////////

export function getPriorityByName(priorityName: string): PrioritySettings | null {
    const { plugin } = getGlobals();
    const allPrioritySettings = [...plugin.settings.priorities];

    // Remove [[ ]] from priorityName
    const strippedPriorityName = priorityName.replace('[[', '').replace(']]', '');
    const sanitizedPriorityName = sanitizeInternalLinkName(strippedPriorityName);

    for (const prioritySettings of allPrioritySettings) {
        if (prioritySettings.name === sanitizedPriorityName) {
            return prioritySettings;
        }
    }

    return null;
}
