import './card-browser.scss';
import * as React from "react";
import ProjectBrowserPlugin from "src/main";
import { FolderSection, StateSection, StatelessSection } from "../section/section";
import { Menu, Notice, TFile, TFolder, View, WorkspaceLeaf } from 'obsidian';
import { BackButtonAndPath } from '../back-button-and-path/back-button-and-path';
import { getSortedItemsInFolder, refreshFolderReference } from 'src/logic/folder-processes';
import { CurrentFolderMenu } from '../current-folder-menu/current-folder-menu';
import { CardBrowserViewEState, CardBrowserViewState, PartialCardBrowserViewState, ProjectCardsView } from 'src/views/card-browser-view/card-browser-view';
import { getScrollOffset } from 'src/logic/file-processes';

//////////
//////////

export interface CardBrowserHandlers {
    setEState: (eState: CardBrowserViewEState) => void,
    setState: (eState: CardBrowserViewState) => void,
}

interface CardBrowserProps {
    path: string,
    plugin: ProjectBrowserPlugin,
    setViewStateWithHistory: (viewState: PartialCardBrowserViewState) => void,
    saveReturnState: (props: {lastOpenedFilePath: string}) => {},
    setHandlers: (handlers: CardBrowserHandlers) => void,
}

export const CardBrowser = (props: CardBrowserProps) => {
    const [state, setState] = React.useState<CardBrowserViewState>({path: props.path});
    const [eState, setEState] = React.useState<CardBrowserViewEState>();

    // const [files, setFiles] = useState
    const v = props.plugin.app.vault;
    // const [path, setPath] = React.useState(props.path);
    const folder = v.getAbstractFileByPath(state.path) as TFolder; // TODO: Check this is valid?
    // const [sectionsOfItems, setSectionsOfItems] = React.useState( getSortedItemsInFolder(props.plugin, folder) );
    const sectionsOfItems = getSortedItemsInFolder(props.plugin, folder);
    
    const lastOpenedFilePath = eState?.lastOpenedFilePath || '';
    console.log('lastOpenedFilePath', lastOpenedFilePath);

    // on mount
    React.useEffect( () => {
        props.setHandlers({
            setEState:  (eState) => setEState(eState),
            setState:  (state) => setState(state),
        })
    },[])
    
    return <>
        <div
            className = 'project-browser_browser'
        >
            <BackButtonAndPath
                folder = {folder}
                onBackClick = {openParentFolder}
                onFolderClick = { (folder: TFolder) => openFolder(folder)}
            />
            <div>
                {sectionsOfItems.map( (section) => (
                    <div  key={section.title}>
                        {section.type === "folders" && (
                            <FolderSection section={section} openFolder={openFolder}/>
                        )}
                        {section.type === "state" && (
                            <StateSection section={section} openFile={openFile} lastOpenedFilePath={lastOpenedFilePath}/>
                        )}
                        {section.type === "stateless" && (
                            <StatelessSection section={section} openFile={openFile} lastOpenedFilePath={lastOpenedFilePath}/>
                        )}
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
        let { workspace } = props.plugin.app;
        let leaf = workspace.getMostRecentLeaf();
        
        if(leaf) {
            props.saveReturnState({
                lastOpenedFilePath: '',
            });
        }

        props.setViewStateWithHistory({
            path: nextFolder.path,
        });
        // setSectionsOfItems(getSortedItemsInFolder(props.plugin, nextFolder) );
    }
    
    function openFile(file: TFile) {
        let { workspace } = props.plugin.app;
        let leaf = workspace.getMostRecentLeaf();

        if(leaf) {
            props.saveReturnState({
                lastOpenedFilePath: file.path,
            });
        } else {
            leaf = workspace.getLeaf();
        }

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