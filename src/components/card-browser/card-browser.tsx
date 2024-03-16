import './card-browser.scss';
import * as React from "react";
import ProjectCardsPlugin from "src/main";
import { SectionHeader } from "../section-header/section-header";
import { CardSet } from "../card-set/card-set";
import { TFile, TFolder, WorkspaceLeaf } from 'obsidian';
import { BackButtonAndPath } from '../back-button-and-path/back-button-and-path';
import { getSortedItemsInFolder, refreshFolderReference } from 'src/logic/folder-processes';
import { CurrentFolderMenu } from '../current-folder-menu/current-folder-menu';

//////////
//////////

interface CardBrowserProps {
    plugin: ProjectCardsPlugin,
}

export const CardBrowser = (props: CardBrowserProps) => {
    // const [files, setFiles] = useState
    const v = props.plugin.app.vault;
    const [curFolder, setCurFolder] = React.useState( v.getRoot() );
    const [sectionsOfItems, setSectionsOfItems] = React.useState( getSortedItemsInFolder(props.plugin, curFolder) );

    // on mount
    React.useEffect( () => {
        //
    },[])

    
    return <>
        <div
            className = 'project-browser_browser'
        >
            <BackButtonAndPath
                folder = {curFolder}
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
            folder = {curFolder}
            refreshView = {refreshView}
        />
    </>;

    ////////

    function openFolder(nextFolder: TFolder) {
        setCurFolder(nextFolder);
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
        const nextFolder = curFolder.parent;
        if(!nextFolder) return;
        openFolder(nextFolder);
    }

    function refreshView() {
        // TODO: This doesn't work, not sure why
        // console.log('curFolder', curFolder);
        // const refreshedFolder = refreshFolderReference(curFolder);
        // console.log(curFolder === refreshedFolder);
        // console.log('getSortedItemsInFolder(props.plugin, curFolder)', getSortedItemsInFolder(props.plugin, curFolder))
        // console.log('getSortedItemsInFolder(props.plugin, refreshedFolder)', getSortedItemsInFolder(props.plugin, refreshedFolder))
        // setSectionsOfItems( getSortedItemsInFolder(props.plugin, refreshedFolder) );
    }

};

//////////
//////////

export default CardBrowser;