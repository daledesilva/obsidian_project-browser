import './detailed-note-card-set.scss';
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as React from "react";
import { DetailedNoteCard } from "../cards/detailed-note-card/detailed-note-card";

/////////
/////////

interface DetailedNoteCardSetProps {
    files: TAbstractFile[],
    onFileSelect: (file: TFile) => void,
}
export const DetailedNoteCardSet = (props: DetailedNoteCardSetProps) => {

    const cards = props.files.map( file => {
        return <DetailedNoteCard
            file = {file as TFile}
            key = {file.path}
            onSelect = {props.onFileSelect}
        />
    });

    return <>
        <div
            className = 'ddc_pb_detailed-note-card-set'
        >
            {cards}
        </div>
    </>
}

///////


