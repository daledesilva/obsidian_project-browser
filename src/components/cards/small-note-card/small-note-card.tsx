import './small-note-card.scss';
import { TFile } from "obsidian";
import * as React from "react";
import { getFileDisplayName } from 'src/logic/get-file-display-name';
import { NoteCardBase } from '../note-card-base/note-card-base';

/////////
/////////

interface SmallNoteCardProps {
    file: TFile,
}

export const SmallNoteCard = (props: SmallNoteCardProps) => {
    const name = getFileDisplayName(props.file);
    const [articleRotation] = React.useState(Math.random() * 4 - 2);

    return <>
        <NoteCardBase
            file={props.file}
            className="ddc_pb_small-note-card"
            rotation={articleRotation}
        >
            <h3>
                {name}
            </h3>
        </NoteCardBase>
    </>
}








