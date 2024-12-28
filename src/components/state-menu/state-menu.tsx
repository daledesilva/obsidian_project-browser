import './state-menu.scss';
import { MarkdownView, TFile } from 'obsidian';
import * as React from "react";
import classnames from 'classnames';
import { getFileState, setFileState } from 'src/logic/frontmatter-processes';
import { getGlobals } from 'src/logic/stores';
import { debug } from 'src/utils/log-to-console';

//////////
//////////

interface StateMenuProps {
    file: TFile,
}

export const StateMenu = (props: StateMenuProps) => {
    const {plugin} = getGlobals();

    const [file, setFile] = React.useState( props.file );
    const [state, setState] = React.useState( getFileState(file) );
    const [menuIsActive, setMenuIsActive] = React.useState(false);
    const firstRunRef = React.useRef<boolean>(true);
    const stateMenuRef = React.useRef<HTMLDivElement>(null)

    listenForFileChanges();

    let displayState = state;
    debug(['file', file])
    debug(['state', state])
    debug(['displayState', displayState])
    if(!displayState) displayState = 'Set State';

    const visibleStates = plugin.settings.states.visible;
    const hiddenStates = plugin.settings.states.hidden;

    // On first run
    React.useEffect( () => {
        firstRunRef.current = false;

        function handleClickOutside(event: any) {
            if (stateMenuRef.current && !stateMenuRef.current.contains(event.target)) {
                setMenuIsActive(false);
            }
        }
        
        document.addEventListener('pointerdown', handleClickOutside);
        return () => {
            document.removeEventListener('pointerdown', handleClickOutside);
        };


    }, [])

    return (
        <div
            className = "ddc_pb_state-menu"
            ref = {stateMenuRef}
            >
            {!menuIsActive && (
                <button
                    className = {classnames([
                        'ddc_pb_state-btn',
                        'ddc_pb_in-closed-menu',
                        !firstRunRef.current && 'ddc_pb_has-return-transition'
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
                                thisStatesSettings.name === state && 'is-set',
                            ])}
                            onClick = {() => setStateAndCloseMenu(thisStatesSettings.name)}    
                        >
                            {thisStatesSettings.name}
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
                                thisStatesSettings.name === state && 'is-set',
                            ])}
                            onClick = {() => setStateAndCloseMenu(thisStatesSettings.name)}    
                        >
                            {thisStatesSettings.name}
                        </button>
                    ))}
                </div>
                
            </>)}
        </div>
    )

    //////////

    function listenForFileChanges() {
        if(!plugin) return;

        plugin.registerEvent(plugin.app.workspace.on('file-open', (newFile) => {
            if(!newFile) return;
            let leaf = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.leaf;
            if(!leaf) return;

            setState( getFileState(newFile) );
            setFile(newFile);
        }));
    }

    function setStateAndCloseMenu(newState: string) {
        if(!plugin) return;

        if(newState !== state) {
            // set the new state
            setFileState(file, newState)
            setState(newState)
        } else {
            // erase the existing state
            setFileState(file, null)
            setState(null)
        }
        setMenuIsActive(false);
    }

}

