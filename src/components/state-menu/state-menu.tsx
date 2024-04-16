import './state-menu.scss';
import { MarkdownView, TFile } from 'obsidian';
import * as React from "react";
import { PluginContext } from 'src/utils/plugin-context';
import classnames from 'classnames';
import { getFileState, setFileState } from 'src/logic/frontmatter-processes';
import ProjectBrowserPlugin from 'src/main';

//////////
//////////

interface StateMenuProps {
    file: TFile,
    plugin: ProjectBrowserPlugin
}

export const StateMenu = (props: StateMenuProps) => {
    const plugin = React.useContext(PluginContext);
    if(!plugin) return <></>;

    const [file, setFile] = React.useState( props.file );
    const [state, setState] = React.useState( getFileState(plugin, file) );
    const [menuIsActive, setMenuIsActive] = React.useState(false);

    listenForFileChanges();

    let displayState = state;
    if(!displayState) displayState = 'Set State';

    const visibleStates = plugin.settings.states.visible;
    const hiddenStates = plugin.settings.states.hidden;


    return <>
        {!menuIsActive && (
            <button
                className='project-browser_state-btn'
                onClick = {() => {
                    setMenuIsActive(true);
                }}    
            >
                {displayState}
            </button>
        )}
        {menuIsActive && (<>
            <div className='project-browser_visible-state-btns'>
                {visibleStates.map( (thisState) => (
                    <button
                        className = {classnames([
                            'project-browser_state-btn',
                            thisState === state && 'is-set',
                        ])}
                        onClick = {() => setStateAndCloseMenu(thisState)}    
                    >
                        {thisState}
                    </button>
                ))}
            </div>
            <div className='project-browser_hidden-state-btns'>
                {hiddenStates.map( (thisState) => (
                    <button
                        className = {classnames([
                            'project-browser_state-btn',
                            thisState === state && 'is-set',
                        ])}
                        onClick = {() => setStateAndCloseMenu(thisState)}    
                    >
                        {thisState}
                    </button>
                ))}
            </div>
            
        </>)}
    </>

    //////////

    function listenForFileChanges() {
        if(!plugin) return;

        plugin.registerEvent(plugin.app.workspace.on('file-open', (newFile) => {
            if(!newFile) return;
            let leaf = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.leaf;
            if(!leaf) return;

            setState( getFileState(plugin, newFile) );
            setFile(newFile);
        }));
    }

    function setStateAndCloseMenu(newState: string) {
        if(!plugin) return;

        if(newState !== state) {
            // set the new state
            setFileState(plugin, file, newState)
            setState(newState)
        } else {
            // erase the existing state
            setFileState(plugin, file, null)
            setState(null)
        }
        setMenuIsActive(false);
    }

}

