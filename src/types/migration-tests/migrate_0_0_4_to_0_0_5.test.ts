import { describe, expect, test } from "@jest/globals";
import { DEFAULT_PLUGIN_SETTINGS_PRE_0_0_5, PluginSettings_0_0_4 } from '../plugin-settings_0_0_4';
import { migrate_0_0_4_to_0_0_5 } from '../plugin-settings-migrations';
import { DEFAULT_PLUGIN_SETTINGS_0_0_5 } from "../plugin-settings_0_0_5";

///////////
///////////

describe('Plugin setting migration tests', () => {

    test('Migrate 0.0.4 to 0.0.5', () => {
        const settings_0_0_4 = DEFAULT_PLUGIN_SETTINGS_PRE_0_0_5;
        const settings_0_0_5 = migrate_0_0_4_to_0_0_5(settings_0_0_4);
        expect(settings_0_0_5).toEqual(DEFAULT_PLUGIN_SETTINGS_0_0_5);
    });
}); 