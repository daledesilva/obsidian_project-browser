import './card-browser.scss';
import * as React from "react";
import ProjectCardsPlugin from "src/main";
import { SectionHeader } from "../section-header/section-header";
import { CardSet } from "../card-set/card-set";
import { TFile, TFolder, ViewStateResult, WorkspaceLeaf } from 'obsidian';
import { BackButtonAndPath } from '../back-button-and-path/back-button-and-path';
import { getSortedItemsInFolder, refreshFolderReference } from 'src/logic/folder-processes';
import { CurrentFolderMenu } from '../current-folder-menu/current-folder-menu';
import { CARD_BROWSER_VIEW_STATE_TYPE, CardBrowserViewState } from 'src/views/card-browser-view/card-browser-view';

//////////
//////////

interface CardBrowserProps {
    folder: TFolder,
    plugin: ProjectCardsPlugin,
    updateViewState: (viewState: CardBrowserViewState) => void,
}

export const CardBrowser = (props: CardBrowserProps) => {
    // const [files, setFiles] = useState
    const v = props.plugin.app.vault;
    const [folder, setFolder] = React.useState(props.folder);
    const [sectionsOfItems, setSectionsOfItems] = React.useState( getSortedItemsInFolder(props.plugin, folder) );

    // on mount
    React.useEffect( () => {
        //
    },[])

    
    return <>
        <div
            className = 'project-browser_browser'
        >
            <BackButtonAndPath
                folder = {folder}
                onBackClick = {openParentFolder}
            />
            <div>
                {sectionsOfItems.map( (section) => (
                    <div key={section.title}>
                        {section.title !== "Folders" && (
                            <SectionHeader
                                title = {section.title}
                            />
                        )}
                        <CardSet
                            items = {section.items}
                            onFileSelect = {openFile}
                            onFolderSelect = {openChildFolder}
                        />
                    </div>
                ))}
            </div>
        </div>
        <CurrentFolderMenu
            folder = {folder}
            refreshView = {refreshView}
            openFile = {openFile}
        />
    </>;

    ////////

    function openFolder(nextFolder: TFolder) {
        props.updateViewState({
            type: CARD_BROWSER_VIEW_STATE_TYPE,
            state: {
                folder: nextFolder,
            }
        });
        setFolder(nextFolder);
        setSectionsOfItems(getSortedItemsInFolder(props.plugin, nextFolder) );
    }
    
    function openFile(file: TFile) {
        let { workspace } = props.plugin.app;
        let leaf: null | WorkspaceLeaf;
        leaf = workspace.getMostRecentLeaf();
        if(!leaf) leaf = workspace.getLeaf();
        leaf.openFile(file);
    }

    function openChildFolder(nextFolder: TFolder) {
        openFolder(nextFolder);
    }
    function openParentFolder() {
        const nextFolder = folder.parent;
        if(!nextFolder) return;
        openFolder(nextFolder);
    }

    async function refreshView() {
        const refreshedFolder = await refreshFolderReference(folder);
        setSectionsOfItems( getSortedItemsInFolder(props.plugin, refreshedFolder) );
        setFolder(refreshedFolder);
    }

};

//////////
//////////

export default CardBrowser;