import './card-browser-floating-menu.scss';
import { TFolder } from 'obsidian';
import * as React from "react";
import { NewProjectModal } from 'src/modals/new-project-modal/new-project-modal';
import { Plus, Search } from 'lucide-react';
import { createProject } from 'src/utils/file-manipulation';
import { openFileInSameLeaf } from 'src/logic/file-access-processes';
import classNames from 'classnames';

//////////
//////////

interface CardBrowserFloatingMenuProps {
    folder: TFolder,
    searchActive: boolean,
    activateSearch: () => void,
    deactivateSearch: () => void,
}

export const CardBrowserFloatingMenu = (props: CardBrowserFloatingMenuProps) => {
    
    return <>
        <div className='ddc_pb_card-browser-floating-menu'>
            <button
                className = {classNames([
                    'ddc_pb_search-button',
                    props.searchActive && 'ddc_pb_active',
                ])}
                onClick = {() => {
                    if(props.searchActive) {
                        props.deactivateSearch();
                    } else {
                        props.activateSearch();
                    }
                }}    
            >
                <Search size={20} />
            </button>
            <button
                className = 'ddc_pb_new-button'
                onClick = {() => newProject(props.folder)}    
            >
                <Plus size={33} />
            </button>
        </div>
    </>

    //////////

    async function newProject(folder: TFolder) {
        const modal = new NewProjectModal({
            folder: folder,
        })
        try {
            // const newFile = await modal.showModal();
            const newFile = await createProject({
                parentFolder: folder,
                projectName: 'Untitled'
            });
            // Slight delay for better feedback of view refreshing
            // setTimeout( () => { 
            //     cardBrowserContext.rerender();
                // Additional delay for notcing refresh before opening file
                // setTimeout( () => { 
                    openFileInSameLeaf(newFile);
                // }, 500);
            // }, 300)

        } catch(reason) {
            console.log(reason);

        }

    }

}

