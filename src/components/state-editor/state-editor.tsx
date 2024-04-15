import { Root, createRoot } from 'react-dom/client';
import * as React from "react";
import ProjectBrowserPlugin from 'src/main';
import { ReactSortable } from "react-sortablejs";
import './state-editor.scss';
import classnames from 'classnames';

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

    const states = props.plugin.settings.states;

    return <>
        <div
            className = 'ddc_pb_section-header'
        >
            <h2>Order states</h2>
            <h3>Visible states</h3>
            <ReactSortable
                list = {states.visible}
                setList = {() => {}}
                group = 'states'
                animation = {200}
                className = {classnames([
                    'ddc_pb_states-ctrl',
                    'ddc_pb_visible-states-ctrl',
                ])}
            >
                {states.visible.map((state) => (
                    <div
                        key = {state}
                        className = 'ddc_pb_draggable'
                    >
                        {state}
                    </div>
                ))}
            </ReactSortable>
            <h3>Hidden states</h3>
            <ReactSortable
                list = {states.hidden}
                setList = {() => {}}
                group = 'states'
                animation = {200}
                className = {classnames([
                    'ddc_pb_states-ctrl',
                    'ddc_pb_hidden-states-ctrl',
                ])}
            >
                {states.hidden.map((state) => (
                    <div
                        key = {state}
                        className = 'ddc_pb_draggable'
                    >
                        {state}
                    </div>
                ))}
            </ReactSortable>
            {/* <h3>Unused states</h3>
            <p>These state values exist but are being ignored by the Project Browser</p> */}
        </div>
    </>
}