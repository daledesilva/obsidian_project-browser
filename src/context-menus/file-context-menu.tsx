import { Menu, TAbstractFile, TFile } from "obsidian";
import { openFileInBackgroundTab, openFileInSameLeaf } from "src/logic/file-access-processes";
import { createPageVersion } from "src/logic/create-page-version";
import { deleteFileWithConfirmation } from "src/logic/file-processes";
import { basenameHasDraftSuffix, basenameHasHiddenSuffix } from "src/logic/filename-suffixes";
import { getFileStateSettingsAsync, getFilePrioritySettings, setFilePriority, setFileState } from "src/logic/frontmatter-processes";
import { hasFrontmatterSupport } from "src/logic/get-file-type-label";
import { isExtensionUnsupportedByObsidian } from "src/logic/is-extension-unsupported";
import { getStateSettingsForFile } from "src/logic/project-page-states";
import { revealInProjectBrowser } from "src/logic/reveal-in-project-browser";
import { getGlobals } from "src/logic/stores";
import { setFileHiddenFromSearchGraph } from "src/logic/sync-hidden-filename";
import { RenameFileModal } from "src/modals/rename-file-modal/rename-file-modal";
import { PrioritySettings, StateSettings } from "src/types/types-map";
import { getFolderSettings, setFolderExcerptSource } from "src/utils/file-manipulation";
import { isMarkdownFile } from "src/logic/project-excerpt-source";

////////
////////

interface registerFileContextMenuProps {
    fileButtonEl: HTMLElement,
    onFileChange: Function,
    /** @deprecated Pass file via the button's `data-pb-file-path` attribute instead. */
    file?: TFile,
}

function resolveMenuTargetFile(
    vault: { getAbstractFileByPath: (path: string) => TAbstractFile | null },
    fileButtonEl: HTMLElement,
    legacyFile?: TFile,
): TFile | null {
    const filePath = fileButtonEl.dataset.pbFilePath ?? legacyFile?.path;
    if (!filePath) return null;
    const abstractFile = vault.getAbstractFileByPath(filePath);
    return abstractFile instanceof TFile ? abstractFile : null;
}

export function registerFileContextMenu(props: registerFileContextMenuProps): () => void {
    const {plugin} = getGlobals();
    const priorities = JSON.parse(JSON.stringify(plugin.settings.priorities));

    const handleContextMenu = async function(event: MouseEvent) {
        
        // Prevent container divs opening their context menus
        event.stopPropagation();
        
        // Close other menus (Only works on iOS for some reason, but also only needed there)
        activeDocument.body.click();

        const file = resolveMenuTargetFile(plugin.app.vault, props.fileButtonEl, props.file);
        if (!file) return;
        
        const fileExtension = file.extension ?? '';
        const isUnsupported = isExtensionUnsupportedByObsidian(fileExtension);
        const hasFrontmatter = hasFrontmatterSupport(fileExtension);
        const currentFileState = await getFileStateSettingsAsync(file);
        const scopedStateSettings = await getStateSettingsForFile(file);
        const visibleStates = JSON.parse(JSON.stringify(scopedStateSettings.visible));
        visibleStates.reverse();
        const hiddenStates = JSON.parse(JSON.stringify(scopedStateSettings.hidden));
        hiddenStates.reverse();
        const isHiddenFromSearchGraph = basenameHasHiddenSuffix(file.basename);
        const isDraft = basenameHasDraftSuffix(file.basename);
        const menuAllowsCreateVersion = props.fileButtonEl.dataset.pbAllowCreateVersion === 'true';
        const menuIsCurrentPage = props.fileButtonEl.dataset.pbIsCurrentPage === 'true';
        const usesPageMenuVersionRules =
            props.fileButtonEl.dataset.pbAllowCreateVersion !== undefined ||
            props.fileButtonEl.dataset.pbIsCurrentPage !== undefined;

        const projectFolder = file.parent;
        let canCreateVersion = false;
        let canSetExcerptSource = false;
        let isCurrentExcerptSource = false;

        if (projectFolder) {
            const folderSettings = await getFolderSettings(plugin.app.vault, projectFolder);
            if (usesPageMenuVersionRules) {
                // Page menu only: the active live row may spawn another version.
                canCreateVersion = menuAllowsCreateVersion && menuIsCurrentPage && !isDraft;
            }
            // Excerpt sources are markdown-only; canvas/base/etc. stay out of the menu.
            if (isMarkdownFile(file)) {
                canSetExcerptSource = !!folderSettings.isProject;
                isCurrentExcerptSource =
                    folderSettings.excerptSource === file.name ||
                    folderSettings.excerptSource === file.basename;
            }
        }
        
        const menu = new Menu();
        if (!isUnsupported) {
            menu.addItem((item) => {
                item.setTitle('Open in new tab');
                item.onClick(() => {
                    void openFileInBackgroundTab(file);
                });
            });
            menu.addItem((item) => {
                item.setTitle('Reveal in Project Browser');
                item.onClick(() => {
                    void revealInProjectBrowser(file);
                });
            });
            menu.addSeparator();
        } else {
            menu.addItem((item) => {
                item.setTitle('Reveal in Project Browser');
                item.onClick(() => {
                    void revealInProjectBrowser(file);
                });
            });
            menu.addSeparator();
        }
        if (hasFrontmatter) {
            priorities.forEach( (prioritySettings: PrioritySettings) => {
                menu.addItem((item) => {
                    const fileRawPriority = getFilePrioritySettings(file);
                    item.setTitle(prioritySettings.name);
                    if(prioritySettings.name === fileRawPriority?.name) item.setChecked(true);
                    item.onClick(() => {
                        void setFilePriority(file, prioritySettings);
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
                        await setFileState(file, stateSettings);
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
                        await setFileState(file, stateSettings);
                        props.onFileChange();
                    })
                });
            })
            menu.addSeparator();
        }
        if (canCreateVersion) {
            menu.addItem((item) => {
                item.setTitle('Create new version');
                item.onClick(async () => {
                    const liveFile = await createPageVersion(file);
                    if (liveFile) {
                        openFileInSameLeaf(liveFile);
                    }
                    props.onFileChange();
                });
            });
            menu.addSeparator();
        }
        menu.addItem((item) => {
            item.setTitle(isHiddenFromSearchGraph ? 'Show in search/graph' : 'Hide from search/graph');
            item.onClick(async () => {
                await setFileHiddenFromSearchGraph(file, !isHiddenFromSearchGraph);
                props.onFileChange();
            });
        });
        if (canSetExcerptSource && projectFolder) {
            menu.addItem((item) => {
                item.setTitle('Set as excerpt source');
                if (isCurrentExcerptSource) item.setChecked(true);
                item.onClick(async () => {
                    // Toggle off when re-selecting the current source so projects fall back to alphabetical default.
                    await setFolderExcerptSource(
                        projectFolder!,
                        isCurrentExcerptSource ? null : file,
                    );
                    props.onFileChange();
                });
            });
        }
        menu.addItem((item) =>
            item.setTitle("Rename")
            .onClick(() => {
                // renameFileOrFolderInPlace(props.file, props.noteEl);
                void new RenameFileModal({
                    file: file,
                }).showModal()
                props.onFileChange();
            })
        );
        menu.addItem((item) =>
            item.setTitle("Delete")
            .onClick(() => {
                deleteFileWithConfirmation(file);
                props.onFileChange();
            })
        );
        menu.showAtMouseEvent(event);

    };

    props.fileButtonEl.addEventListener('contextmenu', handleContextMenu, false);
    return () => props.fileButtonEl.removeEventListener('contextmenu', handleContextMenu, false);
}
