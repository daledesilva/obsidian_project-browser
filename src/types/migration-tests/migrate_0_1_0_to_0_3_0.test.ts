import { describe, expect, test } from "@jest/globals";
import { migrate_0_1_0_to_0_3_0 } from '../plugin-settings-migrations';
import { DEFAULT_PLUGIN_SETTINGS_0_1_0, PluginSettings_0_1_0 } from "../plugin-settings_0_1_0";
import { DEFAULT_PLUGIN_SETTINGS_0_3_0 } from "../plugin-settings_0_3_0";

///////////
///////////

describe('Plugin setting migration tests', () => {

    test('Migrate 0.1.0 to 0.3.0', () => {
        const settings_0_3_0 = migrate_0_1_0_to_0_3_0(DEFAULT_PLUGIN_SETTINGS_0_1_0 as PluginSettings_0_1_0);
        expect(settings_0_3_0).toEqual(DEFAULT_PLUGIN_SETTINGS_0_3_0);
    });
});
