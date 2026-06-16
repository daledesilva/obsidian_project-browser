import { PLUGIN_KEY } from "src/constants";
import { getGlobals } from "src/logic/stores";

/////////
/////////

export const saveLocally = (key: string, value: string) => {
	const { plugin } = getGlobals();
	plugin.app.saveLocalStorage(`${PLUGIN_KEY}_${key}`, value);
};

export const fetchLocally = (key: string) => {
	const { plugin } = getGlobals();
	return plugin.app.loadLocalStorage(`${PLUGIN_KEY}_${key}`) as string | null;
};
