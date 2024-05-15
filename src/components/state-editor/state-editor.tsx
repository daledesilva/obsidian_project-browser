import { Root, createRoot } from 'react-dom/client';
import * as React from "react";
import ProjectBrowserPlugin from 'src/main';
import { ItemInterface, ReactSortable } from "react-sortablejs";
import './state-editor.scss';
import { NewStateModal } from 'src/modals/new-state-modal/new-state-modal';
import { GripVertical, Plus, Trash, X } from 'lucide-react';
import classNames from 'classnames';
import { Setting } from 'obsidian';
import { StateSettings } from 'src/types/plugin-settings';

//////////
//////////

export function insertStateEditor(containerEl: HTMLElement, plugin: ProjectBrowserPlugin) {
    let root: Root;

    new Setting(containerEl)
    .setClass('ddc_pb_setting')
    .setName('States')
    .setDesc('Notes states will appear in reverse order in the project browser so that more progressed notes are shown higher. Hidden states will not show.')
    
    const sectionEl = containerEl.createDiv('ddc_pb_section');
    const contentEl = sectionEl.createDiv();
    this.root = createRoot(contentEl);
    renderView();

    ////////

    function renderView() {
        this.root.render(
            // <PluginContext.Provider value={this.plugin}>
            <StateEditor plugin={plugin}/>
            // </PluginContext.Provider>
        );
    }

	// const sectionEl = containerEl.createDiv('ddc_pb_section');
	// sectionEl.createEl('p', { text: `For information on this plugin's development, visit the links below. Feel free to leave comments in the development diaries on YouTube.` });
	// const list = sectionEl.createEl('ul');
	// list.createEl('li').createEl('a', {
	// 	href: 'https://github.com/daledesilva/obsidian_project-browser',
	// 	text: 'Roadmap'
	// });
	// list.createEl('li').createEl('a', {
	// 	href: 'https://youtube.com/playlist?list=PLAiv7XV4xFx3_JUHGUp_vrqturMTsoBUZ&si=VO6nlt2v0KG224cY',
	// 	text: 'Development Diaries.'
	// });
	// list.createEl('li').createEl('a', {
	// 	href: 'https://github.com/daledesilva/obsidian_project-browser/issues',
	// 	text: 'Request feature / Report bug.'
	// });
}

interface StateEditorProps {
    plugin: ProjectBrowserPlugin
}

export const StateEditor = (props: StateEditorProps) => {
    const [visibleStates, setVisibleStates] = React.useState<StateItem[]>( convertToStateItems(props.plugin.settings.states.visible) );
    const [hiddenStates, setHiddenStates] = React.useState<StateItem[]>( convertToStateItems(props.plugin.settings.states.hidden) );
    const [isDragging, setIsDragging] = React.useState<boolean>( false );
    const deletedStates: StateItem[] = [];

    return <>
        <div
            className = 'ddc_pb_section-header'
        >

            <div className="ddc_pb_states-section">
                <h3>Visible states</h3>
                <ReactSortable
                    list = {visibleStates}
                    setList = { async (stateItems) => {
                        // props.plugin.settings.states.visible = convertToStates(stateItems);
                        // await props.plugin.saveSettings();
                        // setVisibleStates(stateItems);
                    }}
                    group = 'states'
                    animation = {200}
                    className = {classNames([
                        'ddc_pb_states-ctrl',
                        'ddc_pb_visible-states-ctrl',
                    ])}
                    onStart = {() => {
                        setIsDragging(true);
                    }}
                    onEnd = {() => {
                        setIsDragging(false);
                    }}
                >
                    {visibleStates.map((stateItem) => (
                        <div
                            key = {stateItem.state}
                            className = 'ddc_pb_draggable'
                        >
                            <GripVertical className='ddc_pb_drag-icon'/>
                            {stateItem.state}
                            {/* <div className='ddc_pb_close-btn'>
                                <X className='ddc_pb_delete-icon' size='5em'/>
                            </div> */}
                        </div>
                    ))}
                </ReactSortable>
                <div className="ddc_pb_states-button-group">
                <button
                        className = "ddc_pb_add-button"
                        onClick = { async () => {
                            new NewStateModal({
                                plugin: props.plugin,
                                title: ' Create new visible state',
                                onSuccess: async (newState) => {
                                    // const newStates = props.plugin.settings.states.visible;
                                    // newStates.push(newState);
                                    // await props.plugin.saveSettings();
                                    // setVisibleStates( convertToStateItems(newStates) );
                                }
                            }).open();
                        }}
                    >
                        <Plus/>
                    </button>
                </div>
            </div>

            <div className="ddc_pb_states-section">
                <h3>Hidden states</h3>
                <ReactSortable
                    list = {hiddenStates}
                    setList = { async (stateItems) => {
                        // props.plugin.settings.states.hidden = convertToStates(stateItems);
                        // await props.plugin.saveSettings();
                        // setHiddenStates(stateItems);
                    }}
                    onStart = {() => {
                        setIsDragging(true);
                    }}
                    onEnd = {() => {
                        setIsDragging(false);
                    }}
                    group = 'states'
                    animation = {200}
                    className = {classNames([
                        'ddc_pb_states-ctrl',
                        'ddc_pb_hidden-states-ctrl',
                    ])}
                >
                    {hiddenStates.map((stateItem) => (
                        <div
                            key = {stateItem.state}
                            className = 'ddc_pb_draggable'
                        >
                            <GripVertical className='ddc_pb_drag-icon'/>
                            {stateItem.state}
                        </div>
                    ))}
                </ReactSortable>
                <div className="ddc_pb_states-button-group">
                    <button
                        className = "ddc_pb_add-button"
                        onClick = { async () => {
                            await new NewStateModal({
                                plugin: props.plugin,
                                title: ' Create new hidden state',
                                onSuccess: async (newState) => {
                                    // const newStates = props.plugin.settings.states.hidden;
                                    // newStates.push(newState);
                                    // await props.plugin.saveSettings();
                                    // setHiddenStates( convertToStateItems(newStates) );
                                }
                            }).open();
                        }}
                    >
                        <Plus/>
                    </button>
                </div>
            </div>

            <div
                className = {classNames([
                    'ddc_pb_states-section',
                    'ddc_pb_state-dropzone',
                    isDragging && 'ddc_pb_visible',
                ])}
            >
                <h3>
                    <Trash className='ddc_pb_delete-icon'/>
                    Drag here to delete
                </h3>
                <ReactSortable
                    list = {deletedStates}
                    setList = { () => {}}   // Do nothing as the other lists will save their items
                    group = 'states'
                    animation = {200}
                    className = {classNames([
                        'ddc_pb_states-ctrl',
                    ])}
                >
                    
                </ReactSortable>
            </div>

        </div>
    </>
}

///////
///////

interface StateItem extends ItemInterface {
    state: string
}

function convertToStateItems(stateSettings: StateSettings[]): StateItem[] {
    const stateItems: StateItem[] = [];
    stateSettings.forEach( (thisStateSettings) => {
        stateItems.push({
            id: thisStateSettings.name,
            state: thisStateSettings.name,
        })
    })
    return stateItems;
}

function convertToStates(stateItems: StateItem[]): string[] {
    const states: string[] = [];
    stateItems.forEach( (stateItem) => {
        states.push(stateItem.state)
    })
    return states;
}