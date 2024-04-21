import { Root, createRoot } from 'react-dom/client';
import * as React from "react";
import ProjectBrowserPlugin from 'src/main';
import { ItemInterface, ReactSortable } from "react-sortablejs";
import './state-editor.scss';
import classnames from 'classnames';
import { NewStateModal } from 'src/modals/new-state-modal/new-state-modal';

//////////
//////////

export function insertStateEditor(containerEl: HTMLElement, plugin: ProjectBrowserPlugin) {
    let root: Root;

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

    return <>
        <div
            className = 'ddc_pb_section-header'
        >
            <h2>Project states</h2>
            <p>Your notes can exist in one state at a time. Visible states will appear the project browser tab, while hidden states will not. You can order, add, or delete states below. You can also drag states between visible and hidden.</p>

            <div className="ddc_pb_states-section">
                <h3>Visible states</h3>
                <ReactSortable
                    list = {visibleStates}
                    setList = { async (stateItems) => {
                        props.plugin.settings.states.visible = convertToStates(stateItems);
                        await props.plugin.saveSettings();
                        setVisibleStates(stateItems);
                    }}
                    group = 'states'
                    animation = {200}
                    className = {classnames([
                        'ddc_pb_states-ctrl',
                        'ddc_pb_visible-states-ctrl',
                    ])}
                >
                    {visibleStates.map((stateItem) => (
                        <div
                            key = {stateItem.state}
                            className = 'ddc_pb_draggable'
                        >
                            {stateItem.state}
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
                                    const newStates = props.plugin.settings.states.visible;
                                    newStates.push(newState);
                                    await props.plugin.saveSettings();
                                    setVisibleStates( convertToStateItems(newStates) );
                                }
                            }).open();
                        }}
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="ddc_pb_states-section">
                <h3>Hidden states</h3>
                <ReactSortable
                    list = {hiddenStates}
                    setList = { async (stateItems) => {
                        props.plugin.settings.states.hidden = convertToStates(stateItems);
                        await props.plugin.saveSettings();
                        setHiddenStates(stateItems);
                    }}
                    group = 'states'
                    animation = {200}
                    className = {classnames([
                        'ddc_pb_states-ctrl',
                        'ddc_pb_hidden-states-ctrl',
                    ])}
                >
                    {hiddenStates.map((stateItem) => (
                        <div
                            key = {stateItem.state}
                            className = 'ddc_pb_draggable'
                        >
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
                                    const newStates = props.plugin.settings.states.hidden;
                                    newStates.push(newState);
                                    await props.plugin.saveSettings();
                                    setHiddenStates( convertToStateItems(newStates) );
                                }
                            }).open();
                        }}
                    >
                        +
                    </button>
                </div>
            </div>

        </div>
    </>
}

///////
///////

interface StateItem extends ItemInterface {
    state: string
}

function convertToStateItems(states: string[]): StateItem[] {
    const stateItems: StateItem[] = [];
    states.forEach( (stateName) => {
        stateItems.push({
            id: stateName,
            state: stateName,
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