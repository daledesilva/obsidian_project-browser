import { Root, createRoot } from 'react-dom/client';
import * as React from "react";
import { ItemInterface, ReactSortable } from "react-sortablejs";
import './state-editor.scss';
import { StateSettingsModalBase } from 'src/modals/state-settings-modal-base/state-settings-modal-base';
import { GripVertical, Plus, Settings, Trash } from 'lucide-react';
import classNames from 'classnames';
import { EditStateModal } from 'src/modals/edit-state-modal/edit-state-modal';
import { getGlobals } from 'src/logic/stores';
import { StateSettings } from 'src/types/types-map';
import { NewVisibleStateModal } from 'src/modals/new-visible-state-modal/new-visible-state-modal';
import { NewHiddenStateModal } from 'src/modals/new-hidden-state-modal/new-hidden-state-modal';

//////////
//////////

export function insertStateEditor(containerEl: HTMLElement) {
    const {plugin} = getGlobals();
    let root: Root;

    const sectionEl = containerEl.createDiv('ddc_pb_settings-sub-section');
    const contentEl = sectionEl.createDiv();
    this.root = createRoot(contentEl);
    renderView();

    ////////

    function renderView() {
        this.root.render(
            // <PluginContext.Provider value={this.plugin}>
            <StateEditor/>
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

interface StateEditorProps {}

export const StateEditor = (props: StateEditorProps) => {
    const {plugin} = getGlobals();
    const [visibleStates, setVisibleStates] = React.useState<StateItem[]>( convertToStateItems(plugin.settings.states.visible) );
    const [hiddenStates, setHiddenStates] = React.useState<StateItem[]>( convertToStateItems(plugin.settings.states.hidden) );
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
                        plugin.settings.states.visible = convertToStates(stateItems);
                        await plugin.saveSettings();
                        setVisibleStates(stateItems);
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
                            key = {stateItem.id}
                            className = 'ddc_pb_draggable'
                        >
                            <div className='ddc_pb_draggable-label'>
                                <GripVertical className='ddc_pb_icon ddc_pb_drag-icon'/>
                                {stateItem.stateSettings.name}
                            </div>
                            <Settings
                                className = 'ddc_pb_icon ddc_pb_settings-icon'
                                onClick = { async () => {
                                    new EditStateModal({
                                        stateSettings: stateItem.stateSettings,
                                        onSuccess: async (modifiedState) => {
                                            const newStates = plugin.settings.states.visible.map((stateInArray) => {
                                                // Cycle through all states in the settings and update the one that matches this stateItem's name
                                                if(stateInArray.name === stateItem.stateSettings.name) {
                                                    stateInArray.name = modifiedState.name;
                                                    stateInArray.defaultViewMode = modifiedState.defaultViewMode;
                                                    stateInArray.link = modifiedState.link;
                                                }
                                                return stateInArray;
                                            })
                                            await plugin.saveSettings();
                                            setVisibleStates( convertToStateItems(newStates) );
                                        }
                                    }).open();
                                }}
                            />
                        </div>
                    ))}
                </ReactSortable>
                <div className="ddc_pb_states-button-group">
                <button
                        className = "ddc_pb_add-button"
                        onClick = { async () => {
                            new NewVisibleStateModal({
                                onSuccess: async (newState) => {
                                    const newStates = plugin.settings.states.visible;
                                    newStates.push(newState);
                                    await plugin.saveSettings();
                                    setVisibleStates( convertToStateItems(newStates) );
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
                        plugin.settings.states.hidden = convertToStates(stateItems);
                        await plugin.saveSettings();
                        setHiddenStates(stateItems);
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
                            key = {stateItem.id}
                            className = 'ddc_pb_draggable'
                        >
                            <div className='ddc_pb_draggable-label'>
                                <GripVertical className='ddc_pb_icon ddc_pb_drag-icon'/>
                                {stateItem.stateSettings.name}
                            </div>
                            <Settings
                                className = 'ddc_pb_icon ddc_pb_settings-icon'
                                onClick = { async () => {
                                    new EditStateModal({
                                        stateSettings: stateItem.stateSettings,
                                        onSuccess: async (modifiedState) => {
                                            const newStates = plugin.settings.states.hidden.map((stateInArray) => {
                                                // Cycle through all states in the settings and update the one that matches this stateItem's name
                                                if(stateInArray.name === stateItem.stateSettings.name) {
                                                    stateInArray.name = modifiedState.name;
                                                    stateInArray.defaultViewMode = modifiedState.defaultViewMode;
                                                    stateInArray.link = modifiedState.link;
                                                }
                                                return stateInArray;
                                            })
                                            await plugin.saveSettings();
                                            setHiddenStates( convertToStateItems(newStates) );
                                        }
                                    }).open();
                                }}
                            />
                        </div>
                    ))}
                </ReactSortable>
                <div className="ddc_pb_states-button-group">
                    <button
                        className = "ddc_pb_add-button"
                        onClick = { async () => {
                            new NewHiddenStateModal({
                                onSuccess: async (newState) => {
                                    const newStates = plugin.settings.states.hidden;
                                    newStates.push(newState);
                                    await plugin.saveSettings();
                                    setHiddenStates( convertToStateItems(newStates) );
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
                    'ddc_pb_dropzone-section',
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
                        'ddc_pb_dropzone-ctrl',
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
    id: string,
    stateSettings: StateSettings
}

function convertToStateItems(stateSettings: StateSettings[]): StateItem[] {
    const stateItems: StateItem[] = [];
    stateSettings.forEach( (thisStateSettings) => {
        stateItems.push({
            id: thisStateSettings.name,
            stateSettings: thisStateSettings,
        })
    })
    return stateItems;
}

function convertToStates(stateItems: StateItem[]): StateSettings[] {
    const states: StateSettings[] = [];
    stateItems.forEach( (stateItem) => {
        states.push(stateItem.stateSettings)
    })
    return states;
}