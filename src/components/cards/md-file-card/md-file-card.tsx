import './md-file-card.scss';
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as React from "react";
import { fetchExcerpt } from "src/logic/read-files";

/////////
/////////


interface MdFileCardProps {
    item: TFile,
    onSelect: (file: TFile) => void,
}

export const MdFileCard = (props: MdFileCardProps) => {
    const v = props.item.vault;

    const name = props.item.name;
    const [excerpt, setExcerpt] = React.useState('');

    React.useEffect( () => {
        getExcerpt(props.item);
    }, [])
    
    

    return <>
        <article
            className = 'project-cards_card'
            onClick = { () => {
                props.onSelect(props.item)
            }}
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








