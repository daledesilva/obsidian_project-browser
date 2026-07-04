import { Modal, Notice, Setting } from "obsidian";
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

const RECOMMENDED_HOTKEYS: RecommendedHotkey[] = [
    {
        commandId: 'project-browser:toggle-state-menu',
        commandName: 'Toggle state menu',
        hotkey: { modifiers: ['Mod', 'Shift'], key: 'S' },
    },
    {
        commandId: 'project-browser:cycle-state-backward',
        commandName: "Step note's state backward",
        hotkey: { modifiers: ['Mod', 'Shift'], key: 'ArrowLeft' },
    },
    {
        commandId: 'project-browser:cycle-state-forward',
        commandName: "Step note's state forward",
        hotkey: { modifiers: ['Mod', 'Shift'], key: 'ArrowRight' },
    },
];

export class RecommendedHotkeysModal extends Modal {
    constructor() {
        const { plugin } = getGlobals();
        super(plugin.app);
    }

    onOpen(): void {
        this.titleEl.setText('Apply recommended hotkeys');
        void this.render();
    }

    onClose(): void {
        this.titleEl.empty();
        this.contentEl.empty();
    }

    private async render(): Promise<void> {
        const hotkeyConfig = await this.loadHotkeyConfig();
        const commandNames = this.getCommandNames();
        this.contentEl.empty();

        this.contentEl.createEl('p', {
            text: 'Review each recommended hotkey before applying it. If a hotkey is already assigned elsewhere, you can override that one shortcut without changing the others.',
        });

        for (const recommendation of RECOMMENDED_HOTKEYS) {
            const conflict = this.findConflict(hotkeyConfig, recommendation);
            const isApplied = this.commandHasHotkey(hotkeyConfig, recommendation.commandId, recommendation.hotkey);
            const commandName = commandNames[recommendation.commandId] ?? recommendation.commandName;
            const hotkeyLabel = this.formatHotkey(recommendation.hotkey);

            new Setting(this.contentEl)
                .setName(`${commandName}: ${hotkeyLabel}`)
                .setDesc(
                    isApplied
                        ? 'Already applied.'
                        : conflict
                            ? `Conflicts with ${commandNames[conflict] ?? conflict}.`
                            : 'No conflict found.',
                )
                .addButton((button) => {
                    button.setButtonText(isApplied ? 'Applied' : conflict ? 'Override' : 'Apply');
                    button.setDisabled(isApplied);
                    if (!isApplied) button.setCta();
                    button.onClick(() => {
                        void this.applyHotkey(recommendation);
                    });
                });
        }
    }

    private async applyHotkey(recommendation: RecommendedHotkey): Promise<void> {
        const hotkeyConfig = await this.loadHotkeyConfig();

        // Obsidian stores custom hotkeys by command id. Remove the chosen chord from
        // other commands first so applying a recommendation is a deliberate override.
        for (const commandId of Object.keys(hotkeyConfig)) {
            if (commandId === recommendation.commandId) continue;
            hotkeyConfig[commandId] = hotkeyConfig[commandId].filter(
                (hotkey) => !this.hotkeysMatch(hotkey, recommendation.hotkey),
            );
            if (hotkeyConfig[commandId].length === 0) {
                delete hotkeyConfig[commandId];
            }
        }

        hotkeyConfig[recommendation.commandId] = [recommendation.hotkey];
        await this.saveHotkeyConfig(hotkeyConfig);
        this.syncHotkeyManager(hotkeyConfig);
        new Notice(`Applied ${this.formatHotkey(recommendation.hotkey)} to ${recommendation.commandName}.`);
        await this.render();
    }

    private async loadHotkeyConfig(): Promise<HotkeyConfig> {
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

    private syncHotkeyManager(hotkeyConfig: HotkeyConfig): void {
        const hotkeyManager = (this.app as typeof this.app & {
            hotkeyManager?: {
                customKeys?: HotkeyConfig;
                setHotkeys?: (commandId: string, hotkeys: ObsidianHotkey[]) => void;
                save?: () => void;
            };
        }).hotkeyManager;

        if (!hotkeyManager) return;
        hotkeyManager.customKeys = hotkeyConfig;
        for (const recommendation of RECOMMENDED_HOTKEYS) {
            hotkeyManager.setHotkeys?.(
                recommendation.commandId,
                hotkeyConfig[recommendation.commandId] ?? [],
            );
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
                command.name ?? commandId,
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
        return left.key === right.key && this.normalizeModifiers(left).join('|') === this.normalizeModifiers(right).join('|');
    }

    private normalizeModifiers(hotkey: ObsidianHotkey): string[] {
        return [...(hotkey.modifiers ?? [])].sort();
    }

    private formatHotkey(hotkey: ObsidianHotkey): string {
        return [...(hotkey.modifiers ?? []), hotkey.key].join('+');
    }
}
