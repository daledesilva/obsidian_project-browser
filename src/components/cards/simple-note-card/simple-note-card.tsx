import classNames from 'classnames';
import './simple-note-card.scss';
import { TFile } from "obsidian";
import * as React from "react";
import { getFileExcerpt } from "src/logic/file-processes";
import { trimFilenameExt } from 'src/logic/string-processes';
import { PluginContext } from 'src/utils/plugin-context';
import { registerNoteContextMenu } from 'src/context-menus/note-context-menu';
import { CardBrowserContext } from 'src/components/card-browser/card-browser';

/////////
/////////

interface SimpleNoteCardProps {
    file: TFile,
}

export const SimpleNoteCard = (props: SimpleNoteCardProps) => {
    const plugin = React.useContext(PluginContext);
    const cardBrowserContext = React.useContext(CardBrowserContext)
    const noteRef = React.useRef(null);

    const name = props.file.basename; //trimFilenameExt(props.file.name);
    const showSettleTransition = props.file.path === cardBrowserContext.lastTouchedFilePath;

    const [articleRotation] = React.useState(Math.random() * 4 - 2);
    const [blurbRotation] = React.useState(Math.random() * 2 - 1);
    
    ///////////

    React.useEffect( () => {
        if(!plugin) return;
        if(noteRef.current) registerNoteContextMenu({
            plugin,
            noteEl: noteRef.current,
            file: props.file
        });
    }, [])
    
    return <>
        <article
            ref = {noteRef}
            className = {classNames([
                'ddc_pb_simple-note-card',
                showSettleTransition && 'ddc_pb_closing'
            ])}
            onClick = { () => {
                cardBrowserContext.openFile(props.file)
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








