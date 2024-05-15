import './simple-note-card.scss';
import { TFile } from "obsidian";
import * as React from "react";
import { getFileExcerpt } from "src/logic/file-processes";
import { trimFilenameExt } from 'src/logic/string-processes';
import { PluginContext } from 'src/utils/plugin-context';

/////////
/////////

interface SimpleNoteCardProps {
    file: TFile,
    onSelect: (file: TFile) => void,
}

export const SimpleNoteCard = (props: SimpleNoteCardProps) => {
    const v = props.file.vault;
    const plugin = React.useContext(PluginContext);

    const name = props.file.basename; //trimFilenameExt(props.file.name);
    const [excerpt, setExcerpt] = React.useState('');

    React.useEffect( () => {
        if(!plugin) return;
        if(props.file.extension.toLowerCase() == 'md') {
            getExcerpt(props.file);
        }
    }, [])
    
    return <>
        <article
            className = 'ddc_pb_simple-note-card'
            onClick = { () => {
                props.onSelect(props.file)
            }}
            style = {{
                rotate: Math.random() * 4 - 2 + 'rot',
            }}
        >
            <h3
                style = {{
                    width: 'fit-content',
                    rotate: Math.random() * 2 - 1 + 'deg',
                }}
            >
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








