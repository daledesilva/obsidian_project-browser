import './folder-button.scss';
import { TFolder } from "obsidian";
import * as React from "react";
import { registerFolderContextMenu } from 'src/context-menus/folder-context-menu';
import { getProjectExcerpt, isProjectFolder } from 'src/logic/folder-processes';
import { CardBrowserContext } from '../card-browser/card-browser';
import { getFolderSettings } from 'src/utils/file-manipulation';
import classNames from 'classnames';
import { useAtom, useAtomValue } from 'jotai';
import { getGlobals, showHiddenFoldersAtom } from 'src/logic/stores';

/////////
/////////


interface FolderButtonProps {
    folder: TFolder,
}

export const FolderButton = (props: FolderButtonProps) => {
    const {plugin} = getGlobals();
    const v = props.folder.vault;
    const cardBrowserContext = React.useContext(CardBrowserContext);
    const buttonRef = React.useRef(null);

    const [isHidden, setIsHidden] = React.useState(true);
    const showHidden = useAtomValue(showHiddenFoldersAtom);
    const [excerpt, setExcerpt] = React.useState<null|string>('');

    const name = props.folder.name;

    React.useEffect( () => {
        if(!plugin) return;
        if(buttonRef.current) registerFolderContextMenu({
            folderBtnEl: buttonRef.current,
            folder: props.folder,
            onFolderChange: () => {
                // Slight delay so that settings changes get picked up
                setTimeout( async () => {
                    applyFolderSettings()
                }, 200)
            }
        });
        applyFolderSettings();
    }, [])

    ////////
    
    return <>
        <button
            ref = {buttonRef}
            className = {classNames([
                'ddc_pb_folder-button',
                isHidden && !showHidden && 'ddc_pb_hidden-hidden-folder',
                isHidden && showHidden && 'ddc_pb_visible-hidden-folder',
            ])}
            onClick = { () => {
                cardBrowserContext.openFolder(props.folder)
            }}
            >
            {name}
        </button>
    </>

    ///////
    ///////

    async function getExcerpt(folder:TFolder) {
        // if(await isProjectFolder(plugin, folder)) {
        //     const excerpt = await getProjectExcerpt(plugin, folder);
        //     setExcerpt(excerpt);
        // } else {
        //     // It's a category folder, so no excerpt yet
        // }
    }

    async function applyFolderSettings() {
        const settings = await getFolderSettings(v, props.folder);
        if(settings.isHidden) {
            setIsHidden(true);
        } else {
            setIsHidden(false);
        }
    }

}








