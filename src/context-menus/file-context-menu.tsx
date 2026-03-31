import { Menu, TFile } from "obsidian";
import { openFileInBackgroundTab } from "src/logic/file-access-processes";
import { deleteFileWithConfirmation } from "src/logic/file-processes";
import { getFileStateSettingsAsync, getFilePrioritySettings, setFilePriority, setFileState } from "src/logic/frontmatter-processes";
import { hasFrontmatterSupport } from "src/logic/get-file-type-label";
import { isExtensionUnsupportedByObsidian } from "src/logic/is-extension-unsupported";
import { getStateSettingsForFile } from "src/logic/project-page-states";
import { revealInProjectBrowser } from "src/logic/reveal-in-project-browser";
import { getGlobals } from "src/logic/stores";
import { RenameFileModal } from "src/modals/rename-file-modal/rename-file-modal";
import { PrioritySettings, StateSettings } from "src/types/types-map";

////////
////////

interface registerFileContextMenuProps {
    fileButtonEl: HTMLElement,
    file: TFile,
    onFileChange: Function,
}

export function registerFileContextMenu(props: registerFileContextMenuProps) {
    const {plugin} = getGlobals();
    const priorities = JSON.parse(JSON.stringify(plugin.settings.priorities));

    props.fileButtonEl.addEventListener('contextmenu', async function(event) {
        
        // Prevent container divs opening their context menus
        event.stopPropagation();
        
        // Close other menus (Only works on iOS for some reason, but also only needed there)
        document.body.click();
        
        const fileExtension = props.file.extension ?? '';
        const isUnsupported = isExtensionUnsupportedByObsidian(fileExtension);
        const hasFrontmatter = hasFrontmatterSupport(fileExtension);
        const currentFileState = await getFileStateSettingsAsync(props.file);
        const scopedStateSettings = await getStateSettingsForFile(props.file);
        const visibleStates = JSON.parse(JSON.stringify(scopedStateSettings.visible));
        visibleStates.reverse();
        const hiddenStates = JSON.parse(JSON.stringify(scopedStateSettings.hidden));
        hiddenStates.reverse();
        
        const menu = new Menu();
        if (!isUnsupported) {
            menu.addItem((item) => {
                item.setTitle('Open in new tab');
                item.onClick(() => {
                    openFileInBackgroundTab(props.file)
                });
            });
            menu.addItem((item) => {
                item.setTitle('Reveal in Project Browser');
                item.onClick(() => {
                    void revealInProjectBrowser(props.file);
                });
            });
            menu.addSeparator();
        } else {
            menu.addItem((item) => {
                item.setTitle('Reveal in Project Browser');
                item.onClick(() => {
                    void revealInProjectBrowser(props.file);
                });
            });
            menu.addSeparator();
        }
        if (hasFrontmatter) {
            priorities.forEach( (prioritySettings: PrioritySettings) => {
                menu.addItem((item) => {
                    const fileRawPriority = getFilePrioritySettings(props.file);
                    item.setTitle(prioritySettings.name);
                    if(prioritySettings.name === fileRawPriority?.name) item.setChecked(true);
                    item.onClick(() => {
                        setFilePriority(props.file, prioritySettings);
                        props.onFileChange();
                    });
                });
            })
            menu.addSeparator();
            visibleStates.forEach( (stateSettings: StateSettings) => {
                menu.addItem((item) => {
                    item.setTitle(stateSettings.name);
                    if(stateSettings.name === currentFileState?.name) item.setChecked(true);
                    item.onClick(async () => {
                        await setFileState(props.file, stateSettings);
                        props.onFileChange();
                    });
                });
            })
            menu.addSeparator();
            hiddenStates.forEach( (stateSettings: StateSettings) => {
                menu.addItem((item) => {
                    item.setTitle(stateSettings.name);
                    if(stateSettings.name === currentFileState?.name) item.setChecked(true);
                    item.onClick(async () => {
                        await setFileState(props.file, stateSettings);
                        props.onFileChange();
                    })
                });
            })
            menu.addSeparator();
        }
        menu.addItem((item) =>
            item.setTitle("Rename")
            .onClick(() => {
                // renameFileOrFolderInPlace(props.file, props.noteEl);
                new RenameFileModal({
                    file: props.file,
                }).showModal()
                props.onFileChange();
            })
        );
        menu.addItem((item) =>
            item.setTitle("Delete")
            .onClick(() => {
                deleteFileWithConfirmation(props.file);
                props.onFileChange();
            })
        );
        menu.showAtMouseEvent(event);

    }, false);


}