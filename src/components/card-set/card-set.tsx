import './card-set.scss';
import { TAbstractFile } from "obsidian";
import * as React from "react";
import { Card } from "../card/card";

/////////
/////////


interface CardSetProps {
    items: TAbstractFile[]
}

export const CardSet = (props: CardSetProps) => {

    const cards = props.items.map( item => {
        return <Card
            item = {item}
            key = {item.path}
        />
    });

    return <>
        <div
            className = 'project-cards_card-set'
        >
            {cards}
        </div>
    </>
}


