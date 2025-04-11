import * as React from "react";
import classNames from 'classnames';
import './detailed-note-card.scss';
import { TFile } from "obsidian";
import { getFileExcerpt } from "src/logic/file-processes";
import { registerFileContextMenu } from 'src/context-menus/file-context-menu';
import { CardBrowserContext } from 'src/components/card-browser/card-browser';
import { getGlobals } from 'src/logic/stores';
import { openFileInBackgroundTab, openFileInSameLeaf } from 'src/logic/file-access-processes';
import { getFileDisplayName } from 'src/logic/get-file-display-name';
import { getFilePrioritySettings } from 'src/logic/frontmatter-processes';

/////////
/////////

interface DetailedNoteCardProps {
    file: TFile,
}

export const DetailedNoteCard = (props: DetailedNoteCardProps) => {
    const {plugin} = getGlobals();
    const cardBrowserContext = React.useContext(CardBrowserContext);
    const noteRef = React.useRef(null);
    
    const name = getFileDisplayName(props.file);
    const prioritySettings = getFilePrioritySettings(props.file);
    const [excerpt, setExcerpt] = React.useState('');
    const showSettleTransition = props.file.path === cardBrowserContext.lastTouchedFilePath;

    const [articleRotation] = React.useState(Math.random() * 4 - 2);
    const [titleRotation] = React.useState(Math.random() * 2 - 1);
    const [blurbRotation] = React.useState(Math.random() * 2 - 1);

    ////////

    React.useEffect( () => {
        if(!plugin) return;
        if(props.file.extension.toLowerCase() == 'md') {
            getExcerpt(props.file);
        }
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
                'ddc_pb_detailed-note-card',
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
                rotate: articleRotation + 'deg',
            }}
        >
            <h3
                style = {{
                    rotate: titleRotation + 'deg',
                }}
            >
                {name}
            </h3>
            <p
                style = {{
                    rotate: blurbRotation + 'deg',
                }}
            >
                {excerpt}
            </p>
        </article>
    </>

    ///////
    ///////

    async function getExcerpt(file: TFile) {
        const excerpt = await getFileExcerpt(file);
        if(!excerpt) return;
        setExcerpt(excerpt);
    }

}








