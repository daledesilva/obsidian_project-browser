import { Root, createRoot } from 'react-dom/client';
import * as React from "react";
import { ItemInterface, ReactSortable } from "react-sortablejs";
import '../state-editor/state-editor.scss';
import { GripVertical, Plus, Settings, Trash } from 'lucide-react';
import classNames from 'classnames';
import { getGlobals } from 'src/logic/stores';
import { StateSettings } from 'src/types/types-map';
import { EditProjectPageStateModal } from 'src/modals/edit-project-page-state-modal/edit-project-page-state-modal';
import { NewVisibleProjectPageStateModal } from 'src/modals/new-visible-project-page-state-modal/new-visible-project-page-state-modal';
import { NewHiddenProjectPageStateModal } from 'src/modals/new-hidden-project-page-state-modal/new-hidden-project-page-state-modal';

export function insertProjectPageStateEditor(containerEl: HTMLElement) {
    let root: Root;

    const sectionEl = containerEl.createDiv('ddc_pb_settings-sub-section');
    const contentEl = sectionEl.createDiv();
    this.root = createRoot(contentEl);
    renderView();

    function renderView() {
        this.root.render(<ProjectPageStateEditor />);
    }
}

export const ProjectPageStateEditor = () => {
    const {plugin} = getGlobals();
    const [visibleStates, setVisibleStates] = React.useState<StateItem[]>( convertToStateItems(plugin.settings.projectPageStates.visible) );
    const [hiddenStates, setHiddenStates] = React.useState<StateItem[]>( convertToStateItems(plugin.settings.projectPageStates.hidden) );
    const [isDragging, setIsDragging] = React.useState<boolean>( false );
    const deletedStates: StateItem[] = [];

    return <>
        <div className='ddc_pb_section-header ddc_pb_states-section-list'>
            <div className="ddc_pb_states-section">
                <h3>Visible page states</h3>
                <ReactSortable
                    list = {visibleStates}
                    setList = { async (stateItems) => {
                        plugin.settings.projectPageStates.visible = convertToStates(stateItems);
                        await plugin.saveSettings();
                        setVisibleStates(stateItems);
                    }}
                    group = 'project-page-states'
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
                        <div key={stateItem.id} className='ddc_pb_draggable'>
                            <div className='ddc_pb_draggable-label'>
                                <GripVertical className='ddc_pb_icon ddc_pb_drag-icon'/>
                                {stateItem.stateSettings.name}
                            </div>
                            <Settings
                                className='ddc_pb_icon ddc_pb_settings-icon'
                                onClick={ async () => {
                                    new EditProjectPageStateModal({
                                        stateSettings: stateItem.stateSettings,
                                        onSuccess: async (modifiedState) => {
                                            const newStates = plugin.settings.projectPageStates.visible.map((stateInArray) => {
                                                if(stateInArray.name === stateItem.stateSettings.name) {
                                                    stateInArray.name = modifiedState.name;
                                                    stateInArray.defaultViewMode = modifiedState.defaultViewMode;
                                                    stateInArray.link = modifiedState.link;
                                                }
                                                return stateInArray;
                                            });
                                            await plugin.saveSettings();
                                            setVisibleStates(convertToStateItems(newStates));
                                        }
                                    }).open();
                                }}
                            />
                        </div>
                    ))}
                </ReactSortable>
                <div className="ddc_pb_states-button-group">
                    <button
                        className="ddc_pb_add-button"
                        onClick={ async () => {
                            new NewVisibleProjectPageStateModal({
                                onSuccess: async (newState) => {
                                    const newStates = plugin.settings.projectPageStates.visible;
                                    newStates.push(newState);
                                    await plugin.saveSettings();
                                    setVisibleStates(convertToStateItems(newStates));
                                }
                            }).open();
                        }}
                    >
                        <Plus/>
                    </button>
                </div>
            </div>

            <div className="ddc_pb_states-section">
                <h3>Hidden page states</h3>
                <ReactSortable
                    list = {hiddenStates}
                    setList = { async (stateItems) => {
                        plugin.settings.projectPageStates.hidden = convertToStates(stateItems);
                        await plugin.saveSettings();
                        setHiddenStates(stateItems);
                    }}
                    onStart = {() => {
                        setIsDragging(true);
                    }}
                    onEnd = {() => {
                        setIsDragging(false);
                    }}
                    group = 'project-page-states'
                    animation = {200}
                    className = {classNames([
                        'ddc_pb_states-ctrl',
                        'ddc_pb_hidden-states-ctrl',
                    ])}
                >
                    {hiddenStates.map((stateItem) => (
                        <div key={stateItem.id} className='ddc_pb_draggable'>
                            <div className='ddc_pb_draggable-label'>
                                <GripVertical className='ddc_pb_icon ddc_pb_drag-icon'/>
                                {stateItem.stateSettings.name}
                            </div>
                            <Settings
                                className='ddc_pb_icon ddc_pb_settings-icon'
                                onClick={ async () => {
                                    new EditProjectPageStateModal({
                                        stateSettings: stateItem.stateSettings,
                                        onSuccess: async (modifiedState) => {
                                            const newStates = plugin.settings.projectPageStates.hidden.map((stateInArray) => {
                                                if(stateInArray.name === stateItem.stateSettings.name) {
                                                    stateInArray.name = modifiedState.name;
                                                    stateInArray.defaultViewMode = modifiedState.defaultViewMode;
                                                    stateInArray.link = modifiedState.link;
                                                }
                                                return stateInArray;
                                            });
                                            await plugin.saveSettings();
                                            setHiddenStates(convertToStateItems(newStates));
                                        }
                                    }).open();
                                }}
                            />
                        </div>
                    ))}
                </ReactSortable>
                <div className="ddc_pb_states-button-group">
                    <button
                        className="ddc_pb_add-button"
                        onClick={ async () => {
                            new NewHiddenProjectPageStateModal({
                                onSuccess: async (newState) => {
                                    const newStates = plugin.settings.projectPageStates.hidden;
                                    newStates.push(newState);
                                    await plugin.saveSettings();
                                    setHiddenStates(convertToStateItems(newStates));
                                }
                            }).open();
                        }}
                    >
                        <Plus/>
                    </button>
                </div>
            </div>

            <div
                className={classNames([
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
                    list={deletedStates}
                    setList={() => {}}
                    group='project-page-states'
                    animation={200}
                    className={classNames([
                        'ddc_pb_states-ctrl',
                        'ddc_pb_dropzone-ctrl',
                    ])}
                />
            </div>
        </div>
    </>;
};

interface StateItem extends ItemInterface {
    id: string,
    stateSettings: StateSettings
}

function convertToStateItems(stateSettings: StateSettings[]): StateItem[] {
    const stateItems: StateItem[] = [];
    stateSettings.forEach((thisStateSettings) => {
        stateItems.push({
            id: thisStateSettings.name,
            stateSettings: thisStateSettings,
        });
    });
    return stateItems;
}

function convertToStates(stateItems: StateItem[]): StateSettings[] {
    const states: StateSettings[] = [];
    stateItems.forEach((stateItem) => {
        states.push(stateItem.stateSettings);
    });
    return states;
}
