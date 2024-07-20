import classNames from 'classnames';
import './list-note-card.scss';
import { TFile } from "obsidian";
import * as React from "react";
import { getFileExcerpt } from "src/logic/file-processes";
import { trimFilenameExt } from 'src/logic/string-processes';
import { PluginContext } from 'src/utils/plugin-context';
import { registerNoteContextMenu } from 'src/context-menus/note-context-menu';

/////////
/////////

interface ListNoteCardProps {
    file: TFile,
    onSelect: (file: TFile) => void,
    showSettleTransition: boolean,
}

export const ListNoteCard = (props: ListNoteCardProps) => {
    const v = props.file.vault;
    const plugin = React.useContext(PluginContext);
    const noteRef = React.useRef(null);

    const name = props.file.basename; //trimFilenameExt(props.file.name);
    const [excerpt, setExcerpt] = React.useState('');

    React.useEffect( () => {
        if(!plugin) return;
        if(props.file.extension.toLowerCase() == 'md') {
            getExcerpt(props.file);
        }
        if(noteRef.current) registerNoteContextMenu(plugin, noteRef.current, props.file);
    }, [])
    
    return <>
        <article
            ref = {noteRef}
            className = {classNames([
                'ddc_pb_list-note-card',
                props.showSettleTransition && 'ddc_pb_closing'
            ])}
            onClick = { () => {
                props.onSelect(props.file)
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

    async function getExcerpt(file: TFile) {
        const excerpt = await getFileExcerpt(file);
        if(!excerpt) return;
        setExcerpt(excerpt);
    }

}








