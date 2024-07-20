import './detailed-note-card-set.scss';
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as React from "react";
import { DetailedNoteCard } from "../cards/detailed-note-card/detailed-note-card";
import { CardBrowserContext } from '../card-browser/card-browser';

/////////
/////////

interface DetailedNoteCardSetProps {
    files: TAbstractFile[],
}
export const DetailedNoteCardSet = (props: DetailedNoteCardSetProps) => {
    
    const cards = props.files.map( file => {
        return <DetailedNoteCard
            file = {file as TFile}
            key = {file.path}
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


