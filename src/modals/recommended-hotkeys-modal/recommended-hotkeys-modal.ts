import { Modal, Notice, Platform, Setting } from "obsidian";
import "./recommended-hotkeys-modal.scss";
import { getGlobals } from "src/logic/stores";

interface ObsidianHotkey {
    modifiers?: string[];
    key: string;
}

interface RecommendedHotkey {
    commandId: string;
    commandName: string;
    hotkey: ObsidianHotkey;
}

type HotkeyConfig = Record<string, ObsidianHotkey[]>;

// Display names are hardcoded so the modal stays generic (projects, notes, pages)
// and avoids Obsidian's "Project Browser: …" command palette prefix.
const RECOMMENDED_HOTKEYS: RecommendedHotkey[] = [
    {
        commandId: 'project-browser:toggle-state-menu',
        commandName: 'Toggle state menu',
        hotkey: { modifiers: ['Mod', 'Shift'], key: 'S' },
    },
    {
        commandId: 'project-browser:cycle-state-backward',
        commandName: 'Apply previous state',
        hotkey: { modifiers: ['Mod', 'Shift'], key: 'ArrowLeft' },
    },
    {
        commandId: 'project-browser:cycle-state-forward',
        commandName: 'Apply next state',
        hotkey: { modifiers: ['Mod', 'Shift'], key: 'ArrowRight' },
    },
];

const RECOMMENDED_COMMAND_NAMES = Object.fromEntries(
    RECOMMENDED_HOTKEYS.map((recommendation) => [
        recommendation.commandId,
        recommendation.commandName,
    ]),
);

const HOTKEY_KEY_LABELS: Record<string, string> = {
    ArrowLeft: 'Left arrow',
    ArrowRight: 'Right arrow',
    ArrowUp: 'Up arrow',
    ArrowDown: 'Down arrow',
};

const HOTKEY_APPLY_FAILURE_MESSAGE =
    "If this persists, edit the hotkeys manually in the Obsidian Hotkeys settings.";

export class RecommendedHotkeysModal extends Modal {
    // Cached after load/apply so re-render reflects the latest state without reopening.
    private hotkeyConfig: HotkeyConfig | null = null;

    constructor() {
        const { plugin } = getGlobals();
        super(plugin.app);
    }

    onOpen(): void {
        this.hotkeyConfig = null;
        this.titleEl.setText('Recommended Hotkeys');
        void this.render();
    }

    onClose(): void {
        this.titleEl.empty();
        this.contentEl.empty();
        this.hotkeyConfig = null;
    }

    private async render(): Promise<void> {
        const hotkeyConfig = await this.loadHotkeyConfig();
        const commandNames = this.getCommandNames();
        this.contentEl.empty();

        this.contentEl.createEl('p', {
            text: 'Apply the recommended hotkeys below.',
        });

        for (const recommendation of RECOMMENDED_HOTKEYS) {
            const conflict = this.findConflict(hotkeyConfig, recommendation);
            const isApplied = this.commandHasHotkey(hotkeyConfig, recommendation.commandId, recommendation.hotkey);
            const statusText = this.getHotkeyStatusText(isApplied, conflict, commandNames);

            const setting = new Setting(this.contentEl)
                .setClass('ddc_pb_recommended-hotkey-setting')
                .addButton((button) => {
                    button.setButtonText(isApplied ? 'Applied' : conflict ? 'Override' : 'Apply');
                    button.setDisabled(isApplied);
                    if (!isApplied) button.setCta();
                    button.onClick(() => {
                        void this.applyHotkey(recommendation);
                    });
                });

            setting.nameEl.empty();
            setting.nameEl.setText(recommendation.commandName);

            setting.descEl.empty();
            // Line 2: accent chord, then faint bracketed status (applied / conflict / clear).
            const hotkeyLineEl = setting.descEl.createDiv({ cls: 'ddc_pb_recommended-hotkey-line' });
            this.renderHotkeyChord(hotkeyLineEl, recommendation.hotkey);
            hotkeyLineEl.createSpan({
                cls: 'ddc_pb_recommended-hotkey-status',
                text: ` (${statusText})`,
            });
        }
    }

    private getHotkeyStatusText(
        isApplied: boolean,
        conflict: string | null,
        commandNames: Record<string, string>,
    ): string {
        if (isApplied) return 'Already applied.';
        if (conflict) return `Conflicts with ${commandNames[conflict] ?? conflict}.`;
        return 'No conflict found.';
    }

    private renderHotkeyChord(parentEl: HTMLElement, hotkey: ObsidianHotkey): void {
        const hotkeyParts = this.getHotkeyDisplayParts(hotkey);
        hotkeyParts.forEach((part, partIndex) => {
            if (partIndex > 0) {
                parentEl.createSpan({ cls: 'ddc_pb_recommended-hotkey-plus', text: ' + ' });
            }
            parentEl.createSpan({ cls: 'ddc_pb_recommended-hotkey-chord', text: part });
        });
    }

    private async applyHotkey(recommendation: RecommendedHotkey): Promise<void> {
        try {
            const hotkeyConfig = await this.loadHotkeyConfig();
            const changedCommandIds: string[] = [];

            for (const commandId of Object.keys(hotkeyConfig)) {
                if (commandId === recommendation.commandId) continue;
                // Deliberate override: strip this chord from other commands before assigning it here.
                const filteredHotkeys = hotkeyConfig[commandId].filter(
                    (hotkey) => !this.hotkeysMatch(hotkey, recommendation.hotkey),
                );
                if (filteredHotkeys.length === hotkeyConfig[commandId].length) continue;

                if (filteredHotkeys.length === 0) {
                    delete hotkeyConfig[commandId];
                } else {
                    hotkeyConfig[commandId] = filteredHotkeys;
                }
                changedCommandIds.push(commandId);
            }

            hotkeyConfig[recommendation.commandId] = [recommendation.hotkey];
            if (!changedCommandIds.includes(recommendation.commandId)) {
                changedCommandIds.push(recommendation.commandId);
            }

            await this.saveHotkeyConfig(hotkeyConfig);
            this.syncHotkeyManager(hotkeyConfig, changedCommandIds);

            this.hotkeyConfig = JSON.parse(JSON.stringify(hotkeyConfig)) as HotkeyConfig;
            new Notice(`Applied ${this.formatHotkeyForDisplay(recommendation.hotkey)} to ${recommendation.commandName}.`);
            await this.render();
        } catch (error) {
            console.error('Failed to apply recommended hotkey', error);
            new Notice(
                `Couldn't apply ${this.formatHotkeyForDisplay(recommendation.hotkey)} to ${recommendation.commandName}. ${HOTKEY_APPLY_FAILURE_MESSAGE}`,
                8000,
            );
            this.hotkeyConfig = null;
            await this.render();
        }
    }

    private async loadHotkeyConfig(): Promise<HotkeyConfig> {
        if (this.hotkeyConfig) {
            return JSON.parse(JSON.stringify(this.hotkeyConfig)) as HotkeyConfig;
        }

        const hotkeyConfig = await this.readHotkeyConfigFromSource();
        this.hotkeyConfig = hotkeyConfig;
        return JSON.parse(JSON.stringify(hotkeyConfig)) as HotkeyConfig;
    }

    private async readHotkeyConfigFromSource(): Promise<HotkeyConfig> {
        const fromFile = await this.readHotkeyConfigFromFile();
        const fromManager = this.readHotkeyConfigFromManager();
        return { ...fromFile, ...fromManager };
    }

    private readHotkeyConfigFromManager(): HotkeyConfig {
        const hotkeyManager = (this.app as typeof this.app & {
            hotkeyManager?: { customKeys?: HotkeyConfig };
        }).hotkeyManager;

        if (!hotkeyManager?.customKeys) return {};
        return JSON.parse(JSON.stringify(hotkeyManager.customKeys)) as HotkeyConfig;
    }

    private async readHotkeyConfigFromFile(): Promise<HotkeyConfig> {
        const { plugin } = getGlobals();
        const hotkeysPath = this.getHotkeysPath();
        if (!(await plugin.app.vault.adapter.exists(hotkeysPath))) {
            return {};
        }

        const rawConfig = await plugin.app.vault.adapter.read(hotkeysPath);
        if (!rawConfig.trim()) return {};
        return JSON.parse(rawConfig) as HotkeyConfig;
    }

    private async saveHotkeyConfig(hotkeyConfig: HotkeyConfig): Promise<void> {
        const { plugin } = getGlobals();
        await plugin.app.vault.adapter.write(
            this.getHotkeysPath(),
            JSON.stringify(hotkeyConfig, null, '\t'),
        );
    }

    private getHotkeysPath(): string {
        const { plugin } = getGlobals();
        const vault = plugin.app.vault as typeof plugin.app.vault & { configDir: string };
        return `${vault.configDir}/hotkeys.json`;
    }

    private syncHotkeyManager(hotkeyConfig: HotkeyConfig, changedCommandIds: string[]): void {
        // Obsidian exposes customKeys as read-only; setHotkeys + save is the supported sync path.
        const hotkeyManager = (this.app as typeof this.app & {
            hotkeyManager?: {
                setHotkeys?: (commandId: string, hotkeys: ObsidianHotkey[]) => void;
                save?: () => void;
            };
        }).hotkeyManager;

        if (!hotkeyManager?.setHotkeys) return;

        for (const commandId of changedCommandIds) {
            hotkeyManager.setHotkeys(commandId, hotkeyConfig[commandId] ?? []);
        }
        hotkeyManager.save?.();
    }

    private getCommandNames(): Record<string, string> {
        const commands = (this.app as typeof this.app & {
            commands?: { commands?: Record<string, { name?: string }> };
        }).commands?.commands ?? {};

        return Object.fromEntries(
            Object.entries(commands).map(([commandId, command]) => [
                commandId,
                RECOMMENDED_COMMAND_NAMES[commandId] ?? command.name ?? commandId,
            ]),
        );
    }

    private findConflict(
        hotkeyConfig: HotkeyConfig,
        recommendation: RecommendedHotkey,
    ): string | null {
        for (const [commandId, hotkeys] of Object.entries(hotkeyConfig)) {
            if (commandId === recommendation.commandId) continue;
            if (hotkeys.some((hotkey) => this.hotkeysMatch(hotkey, recommendation.hotkey))) {
                return commandId;
            }
        }
        return null;
    }

    private commandHasHotkey(
        hotkeyConfig: HotkeyConfig,
        commandId: string,
        hotkeyToFind: ObsidianHotkey,
    ): boolean {
        return hotkeyConfig[commandId]?.some((hotkey) => this.hotkeysMatch(hotkey, hotkeyToFind)) ?? false;
    }

    private hotkeysMatch(left: ObsidianHotkey, right: ObsidianHotkey): boolean {
        return this.normalizeHotkeyKey(left.key) === this.normalizeHotkeyKey(right.key)
            && this.normalizeModifiers(left).join('|') === this.normalizeModifiers(right).join('|');
    }

    private normalizeHotkeyKey(key: string): string {
        if (key.length === 1) return key.toUpperCase();
        return key;
    }

    private normalizeModifiers(hotkey: ObsidianHotkey): string[] {
        return [...(hotkey.modifiers ?? [])]
            .map((modifier) => this.normalizeModifierForComparison(modifier))
            .sort();
    }

    private normalizeModifierForComparison(modifier: string): string {
        // hotkeys.json may store Mod, Ctrl, or Meta for the same physical modifier.
        if (modifier === 'Mod' || modifier === 'Ctrl' || modifier === 'Meta') {
            return 'Mod';
        }
        return modifier;
    }

    private getHotkeyDisplayParts(hotkey: ObsidianHotkey): string[] {
        const modifierLabels = (hotkey.modifiers ?? []).map((modifier) => {
            if (modifier === 'Mod') {
                return Platform.isMacOS ? 'Command' : 'Control';
            }
            return modifier;
        });
        const keyLabel = HOTKEY_KEY_LABELS[hotkey.key] ?? hotkey.key;
        return [...modifierLabels, keyLabel];
    }

    private formatHotkeyForDisplay(hotkey: ObsidianHotkey): string {
        return this.getHotkeyDisplayParts(hotkey).join('+');
    }
}
