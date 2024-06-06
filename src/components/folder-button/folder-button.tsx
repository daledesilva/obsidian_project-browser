import './folder-button.scss';
import { TFolder } from "obsidian";
import * as React from "react";
import { getProjectExcerpt, isProjectFolder } from 'src/logic/folder-processes';
import ProjectBrowserPlugin from 'src/main';
import { PluginContext } from 'src/utils/plugin-context';

/////////
/////////


interface FolderButtonProps {
    folder: TFolder,
    onSelect: (folder: TFolder) => void,
}

export const FolderButton = (props: FolderButtonProps) => {
    const v = props.folder.vault;
    const plugin = React.useContext(PluginContext);

    const name = props.folder.name;
    const [excerpt, setExcerpt] = React.useState<null|string>('');

    React.useEffect( () => {
        if(!plugin) return;
        getExcerpt(plugin, props.folder);
    }, [])
    
    return <>
        <button
            className = 'project-browser_folder-button'
            onClick = { () => {
                props.onSelect(props.folder)
            }}
        >
            {name}
        </button>
    </>

    ///////
    ///////

    async function getExcerpt(plugin:ProjectBrowserPlugin,  folder:TFolder) {
        // if(await isProjectFolder(plugin, folder)) {
        //     const excerpt = await getProjectExcerpt(plugin, folder);
        //     setExcerpt(excerpt);
        // } else {
        //     // It's a category folder, so no excerpt yet
        // }
    }

}








