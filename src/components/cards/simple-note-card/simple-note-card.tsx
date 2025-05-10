import './simple-note-card.scss';
import { TFile } from "obsidian";
import * as React from "react";
import { getFileDisplayName } from 'src/logic/get-file-display-name';
import { NoteCardBase } from '../note-card-base/note-card-base';

/////////
/////////

interface SimpleNoteCardProps {
    file: TFile,
}

export const SimpleNoteCard = (props: SimpleNoteCardProps) => {
    const name = getFileDisplayName(props.file);
    const [articleRotation] = React.useState(Math.random() * 4 - 2);
    const [blurbRotation] = React.useState(Math.random() * 2 - 1);
    
    return <>
        <NoteCardBase
            file={props.file}
            className="ddc_pb_simple-note-card"
            rotation={articleRotation}
        >
            <h3
                style={{
                    rotate: blurbRotation + 'deg',
                }}
            >
                {name}
            </h3>
        </NoteCardBase>
    </>
}








