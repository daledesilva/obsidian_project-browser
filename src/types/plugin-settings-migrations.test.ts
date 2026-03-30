import { describe, expect, test } from "@jest/globals";
import { migrateOutdatedSettings } from "./plugin-settings-migrations";
import { DEFAULT_PLUGIN_SETTINGS_0_0_5 } from "./plugin-settings_0_0_5";
import { DEFAULT_PLUGIN_SETTINGS_0_4_0 } from "./plugin-settings_0_4_0";

describe("plugin settings migrations (wrapper)", () => {
  test("default project page state is none", () => {
    expect(DEFAULT_PLUGIN_SETTINGS_0_4_0.defaultProjectPageState).toBeUndefined();
  });

  test("migrateOutdatedSettings chains from 0.0.5 and sets expected fields", () => {
    const old = { ...DEFAULT_PLUGIN_SETTINGS_0_0_5, settingsVersion: "0.0.5" } as any;
    const res = migrateOutdatedSettings(old);
    // Verify version bumped
    expect(typeof res.settingsVersion).toBe("string");
    // Verify newly introduced fields in later versions exist
    expect(res).toHaveProperty("useAliases");
    expect(res).toHaveProperty("loopStatesWhenCycling");
    expect(res).toHaveProperty("loopProjectPageStatesWhenCycling");
    // Check stateless section remaps to new keys
    expect(res).toHaveProperty(["stateless", "defaultViewMode"]);
    expect(res).toHaveProperty(["stateless", "defaultViewOrder"]);
    expect(res).toHaveProperty(["projectPageStateless", "defaultViewMode"]);
    expect(res).toHaveProperty(["projectPageStateless", "defaultViewOrder"]);
    // Ensure states arrays preserved and mapped
    expect(Array.isArray(res.states.visible)).toBe(true);
    expect(Array.isArray(res.states.hidden)).toBe(true);
    expect(Array.isArray(res.projectPageStates.visible)).toBe(true);
    expect(Array.isArray(res.projectPageStates.hidden)).toBe(true);
    expect(res.defaultProjectPageState).toBeUndefined();
  });
});


