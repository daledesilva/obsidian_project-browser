import './card-browser.scss';
import * as React from "react";
import { FolderSection } from "../section/folder-section";
import { StateSection } from "../section/state-section";
import { StatelessSection } from "../section/stateless-section";
import { TFile, TFolder } from 'obsidian';
import { BackButtonAndPath } from '../back-button-and-path/back-button-and-path';
import { filterSectionsByString, getSortedSectionsInFolder, orderItemsInSections } from 'src/logic/folder-processes';
import { CardBrowserViewEState, CardBrowserViewState, PartialCardBrowserViewState } from 'src/views/card-browser-view/card-browser-view';
import { v4 as uuidv4 } from 'uuid';
import { registerCardBrowserContextMenu } from 'src/context-menus/card-browser-context-menu';
import { getGlobals } from 'src/logic/stores';
import { SearchInput } from '../search-input/search-input';
import classNames from 'classnames';
import { CardBrowserFloatingMenu } from '../card-browser-floating-menu/card-browser-floating-menu';

//////////
//////////

export const CardBrowserContext = React.createContext<{
    folder: null | TFolder,
    lastTouchedFilePath: string,
    rememberLastTouchedFile: (file: TFile) => void,
    openFolderInSameLeaf: (folder: TFolder) => void,
    rerender: () => void,
}>({
    folder: null,
    lastTouchedFilePath: '',
    rememberLastTouchedFile: () => {},
    openFolderInSameLeaf: () => {},
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
    const [searchActive, setSearchActive] = React.useState<boolean>(false);
    const [searchStr, setSearchStr] = React.useState<string>('');
    const {state, eState} = props.getViewStates();
    const browserRef = React.useRef(null);

    // const setCardBrowserHandlers = useSetAtom(cardBrowserHandlers);

    // const [files, setFiles] = useState
    const v = plugin.app.vault;
    // const [path, setPath] = React.useState(props.path);
    const initialFolder = v.getFolderByPath(state.path) || v.getRoot(); // TODO: Check this is valid?
    let sectionsOfItems = getSortedSectionsInFolder(initialFolder);
    
    filterSectionsByString(sectionsOfItems, searchStr);
    
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
                openFile: () => {}, // TODO: maybe remove this... it used to be a function
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
            openFolderInSameLeaf,
            rememberLastTouchedFile,
            rerender,
        }}>
            <div
                ref = {browserRef}
                className = 'ddc_pb_browser'
            >
                <BackButtonAndPath
                    folder = {initialFolder}
                    onBackClick = {openParentFolder}
                    onFolderClick = { (folder: TFolder) => openFolderInSameLeaf(folder)}
                />
                <div
                    className = {classNames([
                        'ddc_pb_section',
                        'ddc_pb_nav-and-filter-section'
                    ])}
                >
                    {sectionsOfItems.map( (section) => (
                        <React.Fragment key={section.title}>
                            {section.type === "folders" && (<>
                                <FolderSection section={section}/>
                            </>)}
                        </React.Fragment>
                    ))}
                    <SearchInput
                        searchActive = {searchActive}
                        onChange = {setSearchStr}
                        hideSearchInput = {() => setSearchActive(false)}
                        showSearchInput = {() => setSearchActive(true)}
                    />
                </div>
                <div>
                    {sectionsOfItems.map( (section, index) => (
                        <React.Fragment key={section.title}>
                            {section.type !== "folders" && (
                                (!searchActive || (searchActive && section.items.length > 0)) && (
                                    <div>
                                        {section.type === "state" && (
                                            <StateSection section={section}/>
                                        )}
                                        {section.type === "stateless" && (
                                            <StatelessSection section={section}/>
                                        )}
                                    </div>
                                )
                            )}
                        </React.Fragment>
                    ))}
                </div>
                <CardBrowserFloatingMenu
                    folder = {initialFolder}
                    searchActive = {searchActive}
                    activateSearch = {() => setSearchActive(true)}
                    deactivateSearch = {() => setSearchActive(false)}
                />
            </div>
        </CardBrowserContext.Provider>
    );

    ////////

    function rememberLastTouchedFile(file: TFile) {
        props.rememberLastTouchedFilepath(file.path);
    }

    function openFolderInSameLeaf(nextFolder: TFolder) {
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
    
    function openParentFolder() {
        const nextFolder = initialFolder.parent;
        if(!nextFolder) return;
        openFolderInSameLeaf(nextFolder);
    }


};

//////////
//////////

export default CardBrowser;
