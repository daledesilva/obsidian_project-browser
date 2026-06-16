import './card-browser.scss';
import * as React from "react";
import { FolderSection } from "../section/folder-section";
import { StateSection } from "../section/state-section";
import { StatelessSection } from "../section/stateless-section";
import { TFile, TFolder } from 'obsidian';
import { BackButtonAndPath } from '../back-button-and-path/back-button-and-path';
import { filterSectionsByString, getSortedSectionsInFolderAsync } from 'src/logic/folder-processes';
import { CardBrowserViewEState, CardBrowserViewState, PartialCardBrowserViewState } from 'src/views/card-browser-view/card-browser-view';
import { v4 as uuidv4 } from 'uuid';
import { registerCardBrowserContextMenu } from 'src/context-menus/card-browser-context-menu';
import { getGlobals } from 'src/logic/stores';
import { SearchInput } from '../search-input/search-input';
import classNames from 'classnames';
import { CardBrowserFloatingMenu } from '../card-browser-floating-menu/card-browser-floating-menu';
import { getFolderSettings } from 'src/utils/file-manipulation';
import { ProjectFolderStateMenu } from '../state-menu/project-folder-state-menu';

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
    containerEl: HTMLElement,
    path: string,
    setViewStateWithHistory: (viewState: PartialCardBrowserViewState) => void,
    rememberLastTouchedFilepath: (filepath: string) => {},
    resetLastTouchedFilepath: Function,
    getViewStates: () => {state: CardBrowserViewState, eState: CardBrowserViewEState},
    passBackHandlers: (handlers: CardBrowserHandlers) => void;
    /** Persist scroll position; fired on the scrollable `.ddc_pb_browser` region. */
    onBrowserScroll?: () => void;
}

export const CardBrowser = (props: CardBrowserProps) => {
    const {plugin} = getGlobals();
    const [viewInstanceId] = React.useState<string>(uuidv4());
    const [refreshId, setRefreshId] = React.useState<string>(uuidv4());
    const [searchActive, setSearchActive] = React.useState<boolean>(false);
    const [searchStr, setSearchStr] = React.useState<string>('');
    const [parentFolderIsProject, setParentFolderIsProject] = React.useState<boolean>(false);
    const [parentFolderIsInsideProject, setParentFolderIsInsideProject] = React.useState<boolean>(false);
    const [currentFolderIsProject, setCurrentFolderIsProject] = React.useState<boolean>(false);
    const {state, eState} = props.getViewStates();
    const browserRef = React.useRef<HTMLDivElement>(null);
    const fabContainerRef = React.useRef<HTMLDivElement>(null);

    const v = plugin.app.vault;
    const initialFolder = v.getFolderByPath(state.path) || v.getRoot();
    const [sectionsOfItemsRaw, setSectionsOfItemsRaw] = React.useState<import('src/logic/section-processes').Section[] | null>(null);

    React.useEffect(() => {
        const parent = initialFolder.parent;
        if (!parent) {
            setParentFolderIsProject(false);
            setParentFolderIsInsideProject(false);
            return;
        }
        let cancelled = false;
        void getFolderSettings(v, parent).then((settings) => {
            if (cancelled) return;
            const isProject = settings.isProject === true;
            setParentFolderIsProject(isProject);
            if (isProject) {
                setParentFolderIsInsideProject(false);
                return;
            }
            // Walk up ancestors to check if any is a project
            const checkAncestors = async () => {
                let ancestor = parent.parent;
                while (ancestor) {
                    const ancestorSettings = await getFolderSettings(v, ancestor);
                    if (ancestorSettings.isProject === true) {
                        if (!cancelled) setParentFolderIsInsideProject(true);
                        return;
                    }
                    ancestor = ancestor.parent ?? null;
                }
                if (!cancelled) setParentFolderIsInsideProject(false);
            };
            void checkAncestors();
        });
        return () => { cancelled = true; };
    }, [initialFolder.path, refreshId, v]);

    React.useEffect(() => {
        let cancelled = false;
        void getFolderSettings(v, initialFolder).then((settings) => {
            if (!cancelled) setCurrentFolderIsProject(settings.isProject === true);
        });
        return () => { cancelled = true; };
    }, [initialFolder.path, refreshId, v]);

    React.useEffect(() => {
        let cancelled = false;
        void getSortedSectionsInFolderAsync(initialFolder).then((sections) => {
            if (!cancelled) {
                setSectionsOfItemsRaw(sections);
            }
        });
        return () => { cancelled = true; };
    }, [initialFolder.path, refreshId]);

    const sectionsOfItems = React.useMemo(() => {
        if (sectionsOfItemsRaw === null) return null;
        const copy = sectionsOfItemsRaw.map((s) => ({ ...s, items: [...s.items] }));
        filterSectionsByString(copy, searchStr);
        return copy;
    }, [sectionsOfItemsRaw, searchStr]);

    const lastTouchedFilePath = eState?.lastTouchedFilePath || '';

    React.useEffect(() => {
        const scrollEl = browserRef.current;
        const onScroll = props.onBrowserScroll;
        if (!scrollEl || !onScroll) return;
        scrollEl.addEventListener('scroll', onScroll, { passive: true });
        return () => scrollEl.removeEventListener('scroll', onScroll);
    }, [props.onBrowserScroll]);

    // on mount
    React.useEffect( () => {
        if(!plugin) return;
        
        props.passBackHandlers({
            rerender,
        })
        plugin.addGlobalFileDependant(`card-browser_${viewInstanceId}`, rerender);

        if(plugin && browserRef.current) {
            registerCardBrowserContextMenu(browserRef.current, initialFolder, {
                openFile: () => {},
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
            <div className="ddc_pb_card-browser-root">
                <div
                    ref = {browserRef}
                    className = 'ddc_pb_browser'
                >
                    <BackButtonAndPath
                        folder = {initialFolder}
                        onBackClick = {openParentFolder}
                        onFolderClick = { (folder: TFolder) => openFolderInSameLeaf(folder)}
                        refreshKey = {refreshId}
                    />
                    {currentFolderIsProject && (
                        <div className="ddc_pb_card-browser-project-header">
                            <ProjectFolderStateMenu
                                folder={initialFolder}
                                refreshKey={refreshId}
                            />
                        </div>
                    )}
                    <div
                        className = {classNames([
                            'ddc_pb_section',
                            'ddc_pb_nav-and-filter-section'
                        ])}
                    >
                        {(sectionsOfItems ?? []).map( (section) => (
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
                        {(sectionsOfItems ?? []).map( (section) => (
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
                </div>
                <div ref={fabContainerRef} className="ddc_pb_card-browser-fab-container">
                    <CardBrowserFloatingMenu
                        folder={initialFolder}
                        parentFolder={initialFolder.parent}
                        parentFolderIsProject={parentFolderIsProject}
                        parentFolderIsInsideProject={parentFolderIsInsideProject}
                        currentFolderIsProject={currentFolderIsProject}
                        onOpenParentFolder={openParentFolder}
                        onFolderCreated={rerender}
                        searchActive={searchActive}
                        activateSearch={() => setSearchActive(true)}
                        deactivateSearch={() => setSearchActive(false)}
                    />
                </div>
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
