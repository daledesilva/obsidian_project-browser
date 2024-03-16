import './current-folder-menu.scss';
import { TFile, TFolder } from 'obsidian';
import * as React from "react";
import { PluginContext } from 'src/utils/plugin-context';
import classnames from 'classnames';
import { getFileState, setFileState } from 'src/logic/frontmatter-processes';
import { NewProjectModal } from 'src/modals/new-project-modal/new-project-modal';
import ProjectCardsPlugin from 'src/main';
import { Plus } from 'lucide-react';
import { createProject } from 'src/utils/file-manipulation';

//////////
//////////

interface CurrentFolderMenuProps {
    folder: TFolder,
    refreshView: Function,
    openFile: (file: TFile) => {},
}

export const CurrentFolderMenu = (props: CurrentFolderMenuProps) => {
    const plugin = React.useContext(PluginContext);
    if(!plugin) return <></>;

    return <>
        <div className='project-browser_current-folder-menu'>
            <button
                className = 'project-browser_new-button'
                onClick = {() => newProject(plugin, props.folder)}    
            >
                <Plus size={40} />
            </button>
        </div>
    </>

    //////////

    async function newProject(plugin: ProjectCardsPlugin, folder: TFolder) {
        const modal = new NewProjectModal({
            plugin: plugin,
            folder: folder,
        })
        try {
            // const newFile = await modal.showModal();
            const newFile = await createProject(folder, 'Untitled');
            // Slight delay for better feedback of view refreshing
            setTimeout( () => { 
                props.refreshView();
                // Additional delay for notcing refresh before opening file
                setTimeout( () => { 
                    props.openFile(newFile);
                }, 500);
            }, 300)

        } catch(reason) {
            console.log(reason);

        }

    }

}

