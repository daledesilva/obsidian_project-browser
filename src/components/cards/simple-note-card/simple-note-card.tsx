import classNames from 'classnames';
import './simple-note-card.scss';
import { TFile } from "obsidian";
import * as React from "react";
import { getFileExcerpt } from "src/logic/file-processes";
import { trimFilenameExt } from 'src/logic/string-processes';
import { registerFileContextMenu } from 'src/context-menus/file-context-menu';
import { CardBrowserContext } from 'src/components/card-browser/card-browser';
import { getGlobals } from 'src/logic/stores';
import { openFileInBackgroundTab, openFileInSameLeaf } from 'src/logic/file-access-processes';
import { getFileDisplayName } from 'src/logic/get-file-display-name';
import { getFilePrioritySettings } from 'src/logic/frontmatter-processes';
/////////
/////////

interface SimpleNoteCardProps {
    file: TFile,
}

export const SimpleNoteCard = (props: SimpleNoteCardProps) => {
    const {plugin} = getGlobals();
    const cardBrowserContext = React.useContext(CardBrowserContext)
    const noteRef = React.useRef(null);

    const name = getFileDisplayName(props.file);
    const prioritySettings = getFilePrioritySettings(props.file);
    const showSettleTransition = props.file.path === cardBrowserContext.lastTouchedFilePath;

    const [articleRotation] = React.useState(Math.random() * 4 - 2);
    const [blurbRotation] = React.useState(Math.random() * 2 - 1);
    
    ///////////

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
                'ddc_pb_simple-note-card',
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
                rotate: articleRotation + 'rot',
            }}
        >
            <h3
                style = {{
                    rotate: blurbRotation + 'deg',
                }}
            >
                {name}
            </h3>
        </article>
    </>

    ///////
    ///////

}








