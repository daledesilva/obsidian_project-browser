import './state-menu.scss';
import { CachedMetadata, MarkdownView, TFile } from 'obsidian';
import * as React from "react";
import classnames from 'classnames';
import { getFileStateSettings, getFileStateName, setFileState } from 'src/logic/frontmatter-processes';
import { getGlobals, stateMenuAtom } from 'src/logic/stores';
import { useAtomValue } from 'jotai';
import { PluginStateSettings_0_1_0 } from 'src/types/plugin-settings0_1_0';
import { sanitizeInternalLinkName } from 'src/utils/string-processes';

//////////
//////////

interface StateMenuProps {
    file: TFile,
}

export const StateMenu = (props: StateMenuProps) => {
    const {plugin} = getGlobals();
    
    const stateMenuSettings = useAtomValue(stateMenuAtom);
    const [file, setFile] = React.useState( props.file );
    const [stateSettings, setStateSettings] = React.useState<PluginStateSettings_0_1_0 | null>( getFileStateSettings(file) );
    const [menuIsActive, setMenuIsActive] = React.useState(false);
    const showHighlightRef = React.useRef<boolean>(false);
    const stateMenuRef = React.useRef<HTMLDivElement>(null);
    const stateMenuContentRef = React.useRef<HTMLDivElement>(null);
    const resizeObserverRef = React.useRef<ResizeObserver | null>(null);

    // NOTE: This is to allow any listening events to use the updated value when it changes.
    // Because the useState value is captured by the listener's closure and will not update.
    const curFileRef = React.useRef(file);
    React.useEffect(() => {
        curFileRef.current = file;
    }, [file]);


    let displayState = getFileStateName(file);
    if(!displayState) displayState = 'Set State';

    const visibleStates = plugin.settings.states.visible;
    const hiddenStates = plugin.settings.states.hidden;

    // On first run
    React.useEffect( () => {
        function handleClickOutside(event: any) {
            if (stateMenuRef.current && !stateMenuRef.current.contains(event.target)) {
                setMenuIsActive(false);
            }
        }
        
        document.addEventListener('pointerdown', handleClickOutside);
        monitorWorkspaceResizes();
        listenForFileChanges();

        return () => {
            unmonitorWorkspaceResizes();
            document.removeEventListener('pointerdown', handleClickOutside);
        };
    }, [])
    

    // Whenever stateMenuSettings has updated
    React.useEffect( () => {
        setHeight();
    }, [stateMenuSettings])

    // Just after every render
    React.useEffect(() => {
        showHighlightRef.current = false;
    });


    return (
        <div
            className = 'ddc_pb_state-menu'
            ref = {stateMenuRef}
            >
            <div
                className = 'ddc_pb_state-menu-content'
                ref={stateMenuContentRef}
            >

                {!menuIsActive && (
                    <button
                        className = {classnames([
                            'ddc_pb_state-btn',
                            'ddc_pb_in-closed-menu',
                            showHighlightRef.current && 'ddc_pb_has-return-transition'
                        ])}
                        onClick = {() => {
                            setMenuIsActive(true);
                        }}    
                    >
                        {displayState}
                    </button>
                )}
            
                {menuIsActive && (<>
                    <div className='ddc_pb_visible-state-btns'>
                        {visibleStates.map( (thisStatesSettings, index) => (
                            <button
                                key = {index}
                                className = {classnames([
                                    'ddc_pb_state-btn',
                                    'ddc_pb_visible-state',
                                    thisStatesSettings.name === stateSettings?.name && 'is-set',
                                ])}
                                onClick = {() => setStateAndCloseMenu(thisStatesSettings)}    
                            >
                                {sanitizeInternalLinkName(thisStatesSettings.name)}
                            </button>
                        ))}
                    </div>
                    <div className='ddc_pb_hidden-state-btns'>
                        {hiddenStates.map( (thisStatesSettings, index) => (
                            <button
                                key = {index}
                                className = {classnames([
                                    'ddc_pb_state-btn',
                                    'ddc_pb_hidden-state',
                                    thisStatesSettings.name === stateSettings?.name && 'is-set',
                                ])}
                                onClick = {() => setStateAndCloseMenu(thisStatesSettings)}    
                            >
                                {sanitizeInternalLinkName(thisStatesSettings.name)}
                            </button>
                        ))}
                    </div>
                </>)}

            </div>
        </div>
    )

    //////////

    function listenForFileChanges() {
        if(!plugin) return;

        plugin.registerEvent(plugin.app.workspace.on('file-open', (newFile) => {
            if(!newFile) return;
            let leaf = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.leaf;
            if(!leaf) return;

            setFile(newFile);
            const newStateSettings = getFileStateSettings(newFile);
            setStateSettings(newStateSettings);
        }));

        let fileChangeTimeout: NodeJS.Timeout | null = null;
        plugin.registerEvent(plugin.app.metadataCache.on('changed', (modifiedFile: TFile, data: string, cache: CachedMetadata) => {
            if(modifiedFile.path !== curFileRef.current.path) return;
            if(fileChangeTimeout) clearTimeout(fileChangeTimeout);
            fileChangeTimeout = setTimeout(() => {
                showHighlightRef.current = true;
                setStateSettings(getFileStateSettings(curFileRef.current));
            }, 100);
        }));
    }

    function setStateAndCloseMenu(newState: PluginStateSettings_0_1_0) {
        if(!plugin) return;

        if(newState !== stateSettings) {
            // set the new state
            showHighlightRef.current = true;
            if(setFileState(file, newState)) setStateSettings(newState)
        } else {
            // erase the existing state
            showHighlightRef.current = true;
            if(setFileState(file, null)) setStateSettings(null)
        }
        setMenuIsActive(false);
    }

    function setHeight() {
        if(stateMenuSettings.visible) {
            setOpenHeight();
        } else {
            setClosedHeight();
        }
    }
    function setOpenHeight() {
        if(!stateMenuContentRef.current) return;
        if(!stateMenuRef.current) return;
        const contentHeight = stateMenuContentRef.current.getBoundingClientRect().height;
        stateMenuRef.current.style.height = `${contentHeight}px`;
    }
    function setClosedHeight() {
        if(!stateMenuRef.current) return;
        stateMenuRef.current.style.height = '0';
    }

    function monitorWorkspaceResizes() {
        const surroundingWorkspaceSplit = stateMenuRef.current?.closest('.workspace-split');
        resizeObserverRef.current = new ResizeObserver(() => {
            setHeight();
        });
        if (surroundingWorkspaceSplit) {
            resizeObserverRef.current?.observe(surroundingWorkspaceSplit);
        }
    }
    function unmonitorWorkspaceResizes() {
        const surroundingWorkspaceSplit = stateMenuRef.current?.closest('.workspace-split');
        if (surroundingWorkspaceSplit) {
            resizeObserverRef.current?.unobserve(surroundingWorkspaceSplit);
        }
        resizeObserverRef.current?.disconnect();
    }
}

