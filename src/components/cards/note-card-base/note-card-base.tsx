import classNames from 'classnames';
import './note-card-base.scss';
import { TFile } from "obsidian";
import * as React from "react";
import { registerFileContextMenu } from 'src/context-menus/file-context-menu';
import { CardBrowserContext } from 'src/components/card-browser/card-browser';
import { getGlobals } from 'src/logic/stores';
import { openFileInBackgroundTab, openFileInSameLeaf } from 'src/logic/file-access-processes';
import { getFileDisplayName } from 'src/logic/get-file-display-name';
import { getFilePrioritySettings } from 'src/logic/frontmatter-processes';

/////////
/////////

export interface NoteCardBaseProps {
    file: TFile,
    className?: string,
    children?: React.ReactNode,
    rotation?: number,
    titleRotation?: number,
    contentRotation?: number,
}

export const NoteCardBase = (props: NoteCardBaseProps) => {
    const {plugin} = getGlobals();
    const cardBrowserContext = React.useContext(CardBrowserContext);
    const noteRef = React.useRef(null);

    const prioritySettings = getFilePrioritySettings(props.file);
    const showSettleTransition = props.file.path === cardBrowserContext.lastTouchedFilePath;

    React.useEffect( () => {
        if(!plugin) return;
        if(noteRef.current) registerFileContextMenu({
            fileButtonEl: noteRef.current,
            file: props.file,
            onFileChange: () => {
                cardBrowserContext.rememberLastTouchedFile(props.file);
            },
        });
    }, [])
    
    return <>
        <article
            ref = {noteRef}
            className = {classNames([
                'ddc_pb_note-card-base',
                props.className,
                prioritySettings?.name.includes('High') && 'ddc_pb_high-priority',
                prioritySettings?.name.includes('Low') && 'ddc_pb_low-priority',
                showSettleTransition && 'ddc_pb_closing'
            ])}
            onClick = { (event) => {
                if (event.ctrlKey || event.metaKey) {
                    openFileInBackgroundTab(props.file)
                } else {
                    cardBrowserContext.rememberLastTouchedFile(props.file);
                    openFileInSameLeaf(props.file)
                }
            }}
            style = {{
                rotate: props.rotation ? props.rotation + 'deg' : undefined,
            }}
        >
            {props.children}
        </article>
    </>
} 