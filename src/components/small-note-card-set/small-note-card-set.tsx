import './small-note-card-set.scss';
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as React from "react";
import { SmallNoteCard } from '../cards/small-note-card/small-note-card';

/////////
/////////

interface SmallNoteCardSetProps {
    files: TAbstractFile[],
}
export const SmallNoteCardSet = (props: SmallNoteCardSetProps) => {

    const cards = props.files.map( file => {
        return <SmallNoteCard
            key = {file.path}
            file = {file as TFile}
        />
    });

    return <>
        <div
            className = 'ddc_pb_small-note-card-set'
        >
            {cards}
        </div>
    </>
}

///////


