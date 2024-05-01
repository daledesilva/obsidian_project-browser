import './card-browser.scss';
import * as React from "react";
import ProjectBrowserPlugin from "src/main";
import { FolderSection, StateSection, StatelessSection } from "../section/section";
import { TFile, TFolder, WorkspaceLeaf } from 'obsidian';
import { BackButtonAndPath } from '../back-button-and-path/back-button-and-path';
import { getSortedItemsInFolder, refreshFolderReference } from 'src/logic/folder-processes';
import { CurrentFolderMenu } from '../current-folder-menu/current-folder-menu';
import { CardBrowserViewState } from 'src/views/card-browser-view/card-browser-view';

//////////
//////////

interface CardBrowserProps {
    path: string,
    plugin: ProjectBrowserPlugin,
    updateState: (viewState: CardBrowserViewState) => void,
}

export const CardBrowser = (props: CardBrowserProps) => {
    // const [files, setFiles] = useState
    const v = props.plugin.app.vault;
    // const [path, setPath] = React.useState(props.path);
    const folder = v.getAbstractFileByPath(props.path) as TFolder; // TODO: Check this is valid?
    // const [sectionsOfItems, setSectionsOfItems] = React.useState( getSortedItemsInFolder(props.plugin, folder) );
    const sectionsOfItems = getSortedItemsInFolder(props.plugin, folder);

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
                {sectionsOfItems.map( (section) => (<>
                    {section.type === "folders" && (
                        <FolderSection section={section} openFolder={openFolder} key={section.title}/>
                    )}
                    {section.type === "state" && (
                        <StateSection section={section} openFile={openFile} key={section.title}/>
                    )}
                    {section.type === "stateless" && (
                        <StatelessSection section={section} openFile={openFile} key={section.title}/>
                    )}
                </>))}
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
        props.updateState({
            path: nextFolder.path,
        });
        // setSectionsOfItems(getSortedItemsInFolder(props.plugin, nextFolder) );
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
        // setSectionsOfItems( getSortedItemsInFolder(props.plugin, refreshedFolder) );
    }

};

//////////
//////////

export default CardBrowser;