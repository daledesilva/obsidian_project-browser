import './card.scss';
import { TAbstractFile, TFile } from "obsidian";
import * as React from "react";
import { fetchExcerpt } from "src/logic/read-files";

/////////
/////////


interface CardProps {
    item: TAbstractFile
}

export const Card = (props: CardProps) => {
    const v = props.item.vault;

    const name = props.item.name;
    const [excerpt, setExcerpt] = React.useState('');

    React.useEffect( () => {
        getExcerpt(props.item);
    }, [])
    
    

    return <>
        <article
            className='project-cards_card'
        >
            <h3>
                {name}
            </h3>
            <p>
                {excerpt}
            </p>
        </article>
    </>



    ///////
    ///////

    async function getExcerpt(item: TAbstractFile) {
        const excerpt = await fetchExcerpt(item);
        setExcerpt(excerpt);
    }

}








