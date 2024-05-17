import './detailed-note-card.scss';
import { TFile } from "obsidian";
import * as React from "react";
import { getFileExcerpt } from "src/logic/file-processes";
import { trimFilenameExt } from 'src/logic/string-processes';
import { PluginContext } from 'src/utils/plugin-context';

/////////
/////////

interface DetailedNoteCardProps {
    file: TFile,
    onSelect: (file: TFile) => void,
}

export const DetailedNoteCard = (props: DetailedNoteCardProps) => {
    const v = props.file.vault;
    const plugin = React.useContext(PluginContext);

    const name = props.file.basename; //trimFilenameExt(props.file.name);
    const [excerpt, setExcerpt] = React.useState('');

    const [articleRotation] = React.useState(Math.random() * 4 - 2);
    const [titleRotation] = React.useState(Math.random() * 2 - 1);
    const [blurbRotation] = React.useState(Math.random() * 2 - 1);

    ////////

    React.useEffect( () => {
        if(!plugin) return;
        if(props.file.extension.toLowerCase() == 'md') {
            getExcerpt(props.file);
        }
    }, [])
    
    return <>
        <article
            className = 'ddc_pb_detailed-note-card'
            onClick = { () => {
                props.onSelect(props.file)
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








