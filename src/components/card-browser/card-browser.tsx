import './card-browser.scss';
import * as React from "react";
import ProjectBrowserPlugin from "src/main";
import { FolderSection, StateSection, StatelessSection } from "../section/section";
import { TFile, TFolder } from 'obsidian';
import { BackButtonAndPath } from '../back-button-and-path/back-button-and-path';
import { getSortedItemsInFolder } from 'src/logic/folder-processes';
import { CurrentFolderMenu } from '../current-folder-menu/current-folder-menu';
import { CardBrowserViewEState, CardBrowserViewState, PartialCardBrowserViewState } from 'src/views/card-browser-view/card-browser-view';
import { v4 as uuidv4 } from 'uuid';
import { PluginContext } from 'src/utils/plugin-context';
import { registerCardBrowserContextMenu } from 'src/context-menus/card-browser-context-menu';

//////////
//////////

export const CardBrowserContext = React.createContext<{
    folder: null | TFolder,
    lastTouchedFilePath: string,
    rememberLastTouchedFile: (file: TFile) => void,
    openFile: (file: TFile) => void,
    openFolder: (folder: TFolder) => void,
    rerender: () => void,
}>({
    folder: null,
    lastTouchedFilePath: '',
    rememberLastTouchedFile: () => {},
    openFile: () => {},
    openFolder: () => {},
    rerender: () => {},
});

export interface CardBrowserHandlers {
    rerender: Function,
}

interface CardBrowserProps {
    path: string,
    plugin: ProjectBrowserPlugin,
    setViewStateWithHistory: (viewState: PartialCardBrowserViewState) => void,
    rememberLastTouchedFilepath: (filepath: string) => {},
    resetLastTouchedFilepath: Function,
    getViewStates: () => {state: CardBrowserViewState, eState: CardBrowserViewEState},
    passBackHandlers: (handlers: CardBrowserHandlers) => void,
}

export const CardBrowser = (props: CardBrowserProps) => {
    const [viewInstanceId] = React.useState<string>(uuidv4());
    const [refreshId, setRefreshId] = React.useState<number>(uuidv4());
    const {state, eState} = props.getViewStates();
    const plugin = React.useContext(PluginContext);
    const browserRef = React.useRef(null);

    // const [files, setFiles] = useState
    const v = props.plugin.app.vault;
    // const [path, setPath] = React.useState(props.path);
    const folder = v.getAbstractFileByPath(state.path) as TFolder; // TODO: Check this is valid?
    // const [sectionsOfItems, setSectionsOfItems] = React.useState( getSortedItemsInFolder(props.plugin, folder) );
    const sectionsOfItems = getSortedItemsInFolder(props.plugin, folder);
    
    const lastTouchedFilePath = eState?.lastTouchedFilePath || '';

    // on mount
    React.useEffect( () => {
        if(!plugin) return;
        
        props.passBackHandlers({
            rerender,
        })
        props.plugin.addFileDependant(`card-browser_${viewInstanceId}`, rerender);

        // NOTE: When the view is changed to something else, this is never given the chance to unmount.
        // Must removeDependant from elsewhere?
        // return;

        if(browserRef.current) {
            registerCardBrowserContextMenu(plugin, browserRef.current, folder, {openFile});
        }
    },[])


    function rerender() {
        setRefreshId(uuidv4());
    }
    
    return (
        <CardBrowserContext.Provider value={{
            folder,
            lastTouchedFilePath,
            rememberLastTouchedFile,
            openFile,
            openFolder,
        }}>
            <div
                ref = {browserRef}
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
                                <FolderSection section={section}/>
                            )}
                            {section.type === "state" && (
                                <StateSection section={section}/>
                            )}
                            {section.type === "stateless" && (
                                <StatelessSection section={section}/>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <CurrentFolderMenu
                folder = {folder}
                openFile = {openFile}
            />
        </CardBrowserContext.Provider>
    );

    ////////

    function rememberLastTouchedFile(file: TFile) {
        props.rememberLastTouchedFilepath(file.path);
    }

    function openFolder(nextFolder: TFolder) {
        let { workspace } = props.plugin.app;
        let leaf = workspace.getMostRecentLeaf();
        
        // TODO: Unwrap this (remove if)??
        if(leaf) {
            props.resetLastTouchedFilepath();
        }
        
        props.setViewStateWithHistory({
            path: nextFolder.path,
        });
    }
    
    function openFile(file: TFile) {
        let { workspace } = props.plugin.app;
        let leaf = workspace.getMostRecentLeaf();

        if(leaf) {
            props.rememberLastTouchedFilepath(file.path);
        } else {
            leaf = workspace.getLeaf();
        }

        leaf.openFile(file);
    }

    function openParentFolder() {
        const nextFolder = folder.parent;
        if(!nextFolder) return;
        openFolder(nextFolder);
    }


};

//////////
//////////

export default CardBrowser;
