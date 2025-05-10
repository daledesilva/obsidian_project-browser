import './detailed-note-card.scss';
import { TFile } from "obsidian";
import * as React from "react";
import { getFileExcerpt } from "src/logic/file-processes";
import { getFileDisplayName } from 'src/logic/get-file-display-name';
import { NoteCardBase } from '../note-card-base/note-card-base';

/////////
/////////

interface DetailedNoteCardProps {
    file: TFile,
}

export const DetailedNoteCard = (props: DetailedNoteCardProps) => {
    const name = getFileDisplayName(props.file);
    const [excerpt, setExcerpt] = React.useState('');
    const [articleRotation] = React.useState(Math.random() * 4 - 2);
    const [titleRotation] = React.useState(Math.random() * 2 - 1);
    const [blurbRotation] = React.useState(Math.random() * 2 - 1);

    React.useEffect(() => {
        if(props.file.extension.toLowerCase() == 'md') {
            getExcerpt(props.file);
        }
    }, []);

    return <>
        <NoteCardBase
            file={props.file}
            className="ddc_pb_detailed-note-card"
            rotation={articleRotation}
        >
            <h3
                style={{
                    rotate: titleRotation + 'deg',
                }}
            >
                {name}
            </h3>
            <p
                style={{
                    rotate: blurbRotation + 'deg',
                }}
            >
                {excerpt}
            </p>
        </NoteCardBase>
    </>

    async function getExcerpt(file: TFile) {
        const excerpt = await getFileExcerpt(file);
        if(!excerpt) return;
        setExcerpt(excerpt);
    }
}








