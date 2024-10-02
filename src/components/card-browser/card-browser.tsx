import './card-browser.scss';
import * as React from "react";
import { FolderSection, StateSection, StatelessSection } from "../section/section";
import { TFile, TFolder } from 'obsidian';
import { BackButtonAndPath } from '../back-button-and-path/back-button-and-path';
import { getSortedItemsInFolder } from 'src/logic/folder-processes';
import { CurrentFolderMenu } from '../current-folder-menu/current-folder-menu';
import { CardBrowserViewEState, CardBrowserViewState, PartialCardBrowserViewState } from 'src/views/card-browser-view/card-browser-view';
import { v4 as uuidv4 } from 'uuid';
import { PluginContext } from 'src/utils/plugin-context';
import { registerCardBrowserContextMenu } from 'src/context-menus/card-browser-context-menu';
import { atom, useSetAtom } from 'jotai';
import { getGlobals } from 'src/logic/stores';

//////////
//////////

export const CardBrowserContext = React.createContext<{
    folder: null | TFolder,
    lastTouchedFilePath: string,
    rememberLastTouchedFile: (file: TFile) => void,
    openFileInSameLeaf: (file: TFile) => void,
    openFileInBackgroundTab: (file: TFile) => void,
    openFolder: (folder: TFolder) => void,
    rerender: () => void,
}>({
    folder: null,
    lastTouchedFilePath: '',
    rememberLastTouchedFile: () => {},
    openFileInSameLeaf: () => {},
    openFileInBackgroundTab: () => {},
    openFolder: () => {},
    rerender: () => {},
});

export interface CardBrowserHandlers {
    rerender: Function,
}
// export const cardBrowserHandlers = atom<CardBrowserHandlers>()

interface CardBrowserProps {
    path: string,
    setViewStateWithHistory: (viewState: PartialCardBrowserViewState) => void,
    rememberLastTouchedFilepath: (filepath: string) => {},
    resetLastTouchedFilepath: Function,
    getViewStates: () => {state: CardBrowserViewState, eState: CardBrowserViewEState},
    passBackHandlers: (handlers: CardBrowserHandlers) => void,
}

export const CardBrowser = (props: CardBrowserProps) => {
    const {plugin} = getGlobals();
    const [viewInstanceId] = React.useState<string>(uuidv4());
    const [refreshId, setRefreshId] = React.useState<number>(uuidv4());
    const {state, eState} = props.getViewStates();
    const browserRef = React.useRef(null);

    // const setCardBrowserHandlers = useSetAtom(cardBrowserHandlers);

    // const [files, setFiles] = useState
    const v = plugin.app.vault;
    // const [path, setPath] = React.useState(props.path);
    const initialFolder = v.getFolderByPath(state.path) || v.getRoot(); // TODO: Check this is valid?
    let sectionsOfItems = getSortedItemsInFolder(initialFolder);
    
    const lastTouchedFilePath = eState?.lastTouchedFilePath || '';

    // on mount
    React.useEffect( () => {
        if(!plugin) return;
        
        props.passBackHandlers({
            rerender,
        })
        plugin.addGlobalFileDependant(`card-browser_${viewInstanceId}`, rerender);

        // NOTE: When the view is changed to something else, this is never given the chance to unmount.
        // Must removeDependant from elsewhere?
        // return;

        if(plugin && browserRef.current) {
            registerCardBrowserContextMenu(browserRef.current, initialFolder, {
                openFile: openFileInSameLeaf,
                getCurFolder,
            });
        }
        
    },[])

    const getCurFolder = (): TFolder => {
        const curFolder = v.getFolderByPath(props.getViewStates().state.path) || v.getRoot();
        return curFolder;
    }

    function rerender() {
        setRefreshId(uuidv4());
    }
    
    return (
        <CardBrowserContext.Provider value={{
            folder: initialFolder,
            lastTouchedFilePath,
            rememberLastTouchedFile,
            openFileInSameLeaf,
            openFileInBackgroundTab: openFileInBackgroundTab,
            openFolder,
        }}>
            <div
                ref = {browserRef}
                className = 'ddc_pb_browser'
            >
                <BackButtonAndPath
                    folder = {initialFolder}
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
                folder = {initialFolder}
                openFile = {openFileInSameLeaf}
            />
        </CardBrowserContext.Provider>
    );

    ////////

    function rememberLastTouchedFile(file: TFile) {
        props.rememberLastTouchedFilepath(file.path);
    }

    function openFolder(nextFolder: TFolder) {
        const {plugin} = getGlobals();
        let { workspace } = plugin.app;
        let leaf = workspace.getMostRecentLeaf();
        
        // TODO: Unwrap this (remove if)??
        if(leaf) {
            props.resetLastTouchedFilepath();
        }
        
        props.setViewStateWithHistory({
            path: nextFolder.path,
        });
    }
    
    function openFileInSameLeaf(file: TFile) {
        let { workspace } = plugin.app;
        let leaf = workspace.getMostRecentLeaf();

        if(leaf) {
            props.rememberLastTouchedFilepath(file.path);
        } else {
            leaf = workspace.getLeaf();
        }

        leaf.openFile(file);
    }
    async function openFileInBackgroundTab(file: TFile) {
        let { workspace } = plugin.app;
        let curLeaf = workspace.getMostRecentLeaf();
        let newLeaf = workspace.getLeaf(true);

        // Open new tab
        await newLeaf.openFile(file);

        // switch immediately back to previous tab
        if(curLeaf) workspace.setActiveLeaf(curLeaf);
    }

    function openParentFolder() {
        const nextFolder = initialFolder.parent;
        if(!nextFolder) return;
        openFolder(nextFolder);
    }


};

//////////
//////////

export default CardBrowser;
