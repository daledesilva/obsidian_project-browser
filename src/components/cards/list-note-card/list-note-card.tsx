import './list-note-card.scss';
import { TFile } from "obsidian";
import * as React from "react";
import { getFileDisplayName } from 'src/logic/get-file-display-name';
import { NoteCardBase } from '../note-card-base/note-card-base';

/////////
/////////

interface ListNoteCardProps {
    file: TFile,
}

export const ListNoteCard = (props: ListNoteCardProps) => {
    const name = getFileDisplayName(props.file);

    return <>
        <NoteCardBase
            file={props.file}
            className="ddc_pb_list-note-card"
        >
            <h3>
                {name}
            </h3>
        </NoteCardBase>
    </>
}








