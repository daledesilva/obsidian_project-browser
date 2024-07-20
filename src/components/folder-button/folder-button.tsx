import './folder-button.scss';
import { TFolder } from "obsidian";
import * as React from "react";
import { registerFolderContextMenu } from 'src/context-menus/folder-context-menu';
import { getProjectExcerpt, isProjectFolder } from 'src/logic/folder-processes';
import ProjectBrowserPlugin from 'src/main';
import { PluginContext } from 'src/utils/plugin-context';
import { CardBrowserContext } from '../card-browser/card-browser';

/////////
/////////


interface FolderButtonProps {
    folder: TFolder,
}

export const FolderButton = (props: FolderButtonProps) => {
    const v = props.folder.vault;
    const plugin = React.useContext(PluginContext);
    const cardBrowserContext = React.useContext(CardBrowserContext);
    const buttonRef = React.useRef(null);

    const name = props.folder.name;
    const [excerpt, setExcerpt] = React.useState<null|string>('');

    React.useEffect( () => {
        if(!plugin) return;
        if(buttonRef.current) registerFolderContextMenu(plugin, buttonRef.current, props.folder);
    }, [])
    
    return <>
        <button
            ref = {buttonRef}
            className = 'project-browser_folder-button'
            onClick = { () => {
                cardBrowserContext.openFolder(props.folder)
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








