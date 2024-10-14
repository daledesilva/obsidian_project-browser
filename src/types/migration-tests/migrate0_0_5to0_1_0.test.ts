import { describe, expect, test } from "@jest/globals";
import { DEFAULT_SETTINGS_0_0_5, PluginSettings_0_0_5 } from '../plugin-settings0_0_5';
import { migrate0_0_5to0_1_0 } from '../plugin-settings-migrations';

///////////
///////////


describe('Plugin setting migration tests', () => {

    test('Migrate 0.0.5 to 0.1.0', () => {
        const settings0_1_0 = migrate0_0_5to0_1_0(defaultSettings0_0_5 as PluginSettings_0_0_5);
        expect(settings0_1_0).toEqual(defaultSettings0_1_0);
    });
});

///////////
///////////

const defaultSettings0_0_5 = {
    "settingsVersion": "0.0.5",
    "access": {
        "replaceNewTab": true,
        "enableRibbonIcon": true,
        "enableCommand": true
    },
    "showStateMenu": true,
    "folders": {
        "defaultView": "Small"
    },
    "states": {
        "visible": [
            {
                "name": "Idea",
                "defaultView": "Small Cards"
            },
            {
                "name": "Shortlisted",
                "defaultView": "Small Cards"
            },
            {
                "name": "Drafting",
                "defaultView": "Detailed Cards"
            },
            {
                "name": "Focus",
                "defaultView": "Simple Cards"
            },
            {
                "name": "Final",
                "defaultView": "Small Cards"
            }
        ],
        "hidden": [
            {
                "name": "Archived",
                "defaultView": "Small Cards"
            },
            {
                "name": "Cancelled",
                "defaultView": "Detailed Cards"
            }
        ]
    },
    "stateless": {
        "name": "",
        "defaultView": "List"
    }
}

const defaultSettings0_1_0 = {
    "onboardingNotices": {
        "welcomeNoticeRead": false,
        "lastVersionNoticeRead": ""
    },
    "settingsVersion": "0.1.0",
    "access": {
        "replaceNewTab": true,
        "enableRibbonIcon": true,
        "enableCommand": true,
        "launchFolder": "/"
    },
    "showStateMenu": true,
    "folders": {
        "defaultView": "Small"
    },
    "states": {
        "visible": [
            {
                "name": "Idea",
                "defaultView": "Small Cards"
            },
            {
                "name": "Shortlisted",
                "defaultView": "Small Cards"
            },
            {
                "name": "Drafting",
                "defaultView": "Detailed Cards"
            },
            {
                "name": "Focus",
                "defaultView": "Simple Cards"
            },
            {
                "name": "Final",
                "defaultView": "Small Cards"
            }
        ],
        "hidden": [
            {
                "name": "Archived",
                "defaultView": "Small Cards"
            },
            {
                "name": "Cancelled",
                "defaultView": "Detailed Cards"
            }
        ]
    },
    "stateless": {
        "name": "",
        "defaultView": "List"
    }
}