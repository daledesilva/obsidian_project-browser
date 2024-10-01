import './current-folder-menu.scss';
import { TFile, TFolder } from 'obsidian';
import * as React from "react";
import classnames from 'classnames';
import { getFileState, setFileState } from 'src/logic/frontmatter-processes';
import { NewProjectModal } from 'src/modals/new-project-modal/new-project-modal';
import { Plus } from 'lucide-react';
import { createProject } from 'src/utils/file-manipulation';
import { getGlobals } from 'src/logic/stores';

//////////
//////////

interface CurrentFolderMenuProps {
    folder: TFolder,
    openFile: (file: TFile) => void,
}

export const CurrentFolderMenu = (props: CurrentFolderMenuProps) => {
    
    return <>
        <div className='project-browser_current-folder-menu'>
            <button
                className = 'project-browser_new-button'
                onClick = {() => newProject(props.folder)}    
            >
                <Plus size={40} />
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
            const newFile = await createProject(folder, 'Untitled');
            // Slight delay for better feedback of view refreshing
            // setTimeout( () => { 
            //     cardBrowserContext.rerender();
                // Additional delay for notcing refresh before opening file
                // setTimeout( () => { 
                    props.openFile(newFile);
                // }, 500);
            // }, 300)

        } catch(reason) {
            console.log(reason);

        }

    }

}

