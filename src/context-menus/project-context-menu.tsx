import { Menu, TFolder } from "obsidian";
import { deleteFolderWithConfirmation } from "src/logic/file-processes";
import { getGlobals } from "src/logic/stores";
import { RenameFolderModal } from "src/modals/rename-folder-modal/rename-folder-modal";
import { getFolderPriorityName, getFolderPrioritySettings, getFolderStateName, setFolderAsFolder, setFolderPriority, setFolderState } from "src/utils/file-manipulation";
import { PrioritySettings, StateSettings } from "src/types/types-map";

////////
////////

interface registerProjectContextMenuProps {
    projectButtonEl: HTMLElement,
    folder: TFolder,
    onProjectChange: () => void,
}

export function registerProjectContextMenu(props: registerProjectContextMenuProps) {
    const {plugin} = getGlobals();
    const priorities = JSON.parse(JSON.stringify(plugin.settings.priorities));
    const visibleStates = JSON.parse(JSON.stringify(plugin.settings.states.visible));
    visibleStates.reverse();
    const hiddenStates = JSON.parse(JSON.stringify(plugin.settings.states.hidden));
    hiddenStates.reverse();

    props.projectButtonEl.addEventListener('contextmenu', async (event) => {
        event.stopPropagation();
        document.body.click();

        const currentStateName = await getFolderStateName(props.folder);
    const currentPrioritySettings = await getFolderPrioritySettings(props.folder);

        const menu = new Menu();
        menu.addItem((item) =>
            item.setTitle("Set as launch project")
                .onClick(() => {
                    plugin.settings.access.launchFolder = props.folder.path;
                    plugin.saveSettings();
                })
        );
        menu.addItem((item) =>
            item.setTitle("Convert to folder")
                .onClick(async () => {
                    await setFolderAsFolder(props.folder);
                    props.onProjectChange();
                })
        );
        menu.addSeparator();
        priorities.forEach((prioritySettings: PrioritySettings) => {
            menu.addItem((item) => {
                item.setTitle(prioritySettings.name);
                if (prioritySettings.name === currentPrioritySettings?.name) item.setChecked(true);
                item.onClick(async () => {
                    await setFolderPriority(props.folder, prioritySettings);
                    props.onProjectChange();
                });
            });
        });
        menu.addSeparator();
        visibleStates.forEach((stateSettings: StateSettings) => {
            menu.addItem((item) => {
                item.setTitle(stateSettings.name);
                if (stateSettings.name === currentStateName) item.setChecked(true);
                item.onClick(async () => {
                    await setFolderState(props.folder, stateSettings);
                    props.onProjectChange();
                });
            });
        });
        menu.addSeparator();
        hiddenStates.forEach((stateSettings: StateSettings) => {
            menu.addItem((item) => {
                item.setTitle(stateSettings.name);
                if (stateSettings.name === currentStateName) item.setChecked(true);
                item.onClick(async () => {
                    await setFolderState(props.folder, stateSettings);
                    props.onProjectChange();
                });
            });
        });
        menu.addSeparator();
        menu.addItem((item) =>
            item.setTitle("Rename")
                .onClick(() => {
                    new RenameFolderModal({ folder: props.folder }).showModal();
                    props.onProjectChange();
                })
        );
        menu.addItem((item) =>
            item.setTitle("Delete")
                .onClick(() => {
                    deleteFolderWithConfirmation(props.folder);
                    props.onProjectChange();
                })
        );
        menu.showAtMouseEvent(event);
    }, false);
}
