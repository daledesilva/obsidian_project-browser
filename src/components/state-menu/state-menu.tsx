import { TFile } from 'obsidian';
import './state-menu.scss';
import * as React from "react";
import { getFileState } from 'src/logic/read-files';
import ProjectCardsPlugin from 'src/main';
import { PluginContext } from 'src/utils/plugin-context';

//////////
//////////

interface StateMenuProps {
    file: TFile,
}

export const StateMenu = (props: StateMenuProps) => {
    const plugin = React.useContext(PluginContext);
    if(!plugin) return;

    const [state, setState] = React.useState( getFileState(plugin, props.file) );
    const [isActive, setIsActive] = React.useState(false);

    console.log('state', state)
    console.log('state', getFileState(plugin, props.file))
    console.log('props.file', props.file)

    return <>
        <div>
            {isActive && (
                <button className='project-cards_state-btn'>
                    {state}
                </button>
            )}
            {!isActive && (
                <button className='project-cards_state-btn'>
                    {state}
                </button>
            )}
        </div>
    </>
}