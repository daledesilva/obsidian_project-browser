import classNames from 'classnames';
import './list-note-card.scss';
import { TFile } from "obsidian";
import * as React from "react";
import { getFileExcerpt } from "src/logic/file-processes";
import { trimFilenameExt } from 'src/logic/string-processes';
import { PluginContext } from 'src/utils/plugin-context';
import { registerFileContextMenu } from 'src/context-menus/file-context-menu';
import { CardBrowserContext } from 'src/components/card-browser/card-browser';

/////////
/////////

interface ListNoteCardProps {
    file: TFile,
}

export const ListNoteCard = (props: ListNoteCardProps) => {
    const plugin = React.useContext(PluginContext);
    const cardBrowserContext = React.useContext(CardBrowserContext);
    const noteRef = React.useRef(null);

    const name = props.file.basename; //trimFilenameExt(props.file.name);
    const showSettleTransition = props.file.path === cardBrowserContext.lastTouchedFilePath;

    React.useEffect( () => {
        if(!plugin) return;
        if(noteRef.current) registerFileContextMenu({
            plugin,
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
                'ddc_pb_list-note-card',
                showSettleTransition && 'ddc_pb_closing'
            ])}
            onClick = { () => {
                cardBrowserContext.openFile(props.file)
            }}
            // style = {{
            //     rotate: Math.random() * 4 - 2 + 'deg',
            // }}
        >
            <h3>
                {name}
            </h3>
        </article>
    </>

    ///////
    ///////

}








