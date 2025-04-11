import { getGlobals } from "./stores";
import { PrioritySettings } from "src/types/types-map";
import { sanitizeInternalLinkName } from "src/utils/string-processes";

//////////////////
//////////////////

export function getPriorityByName(priorityName: string): PrioritySettings | null {
    const { plugin } = getGlobals();
    const allPrioritySettings = [...plugin.settings.priorities];

    const sanitizedPriorityName = sanitizeInternalLinkName(priorityName);

    for (const prioritySettings of allPrioritySettings) {
        if (prioritySettings.name === sanitizedPriorityName) {
            return prioritySettings;
        }
    }

    return null;
}
