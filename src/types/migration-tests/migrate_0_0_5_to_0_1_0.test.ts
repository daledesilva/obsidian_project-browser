import { describe, expect, test } from "@jest/globals";
import { DEFAULT_PLUGIN_SETTINGS_0_0_5, PluginSettings_0_0_5 } from '../plugin-settings_0_0_5';
import { migrate_0_0_5_to_0_1_0 } from '../plugin-settings-migrations';
import { DEFAULT_PLUGIN_SETTINGS_0_1_0 } from "../plugin-settings_0_1_0";

///////////
///////////

describe('Plugin setting migration tests', () => {

    test('Migrate 0.0.5 to 0.1.0', () => {
        const settings_0_1_0 = migrate_0_0_5_to_0_1_0(DEFAULT_PLUGIN_SETTINGS_0_0_5 as PluginSettings_0_0_5);
        expect(settings_0_1_0).toEqual(DEFAULT_PLUGIN_SETTINGS_0_1_0);
    });
});
