import './md-file-card.scss';
import { FrontMatterCache, TAbstractFile, TFile, TFolder } from "obsidian";
import * as React from "react";
import { fetchExcerpt, getFileTitle } from "src/logic/read-files";
import ProjectCardsPlugin from 'src/main';
import { PluginContext } from 'src/utils/plugin-context';

/////////
/////////


interface MdFileCardProps {
    item: TFile,
    onSelect: (file: TFile) => void,
}

export const MdFileCard = (props: MdFileCardProps) => {
    const v = props.item.vault;
    const plugin = React.useContext(PluginContext);

    const name = getFileTitle(props.item);
    const [excerpt, setExcerpt] = React.useState('');

    React.useEffect( () => {
        if(!plugin) return;
        getExcerpt(plugin, props.item);
    }, [])
    
    return <>
        <article
            className = 'project-cards_file-card'
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

    async function getExcerpt(plugin: ProjectCardsPlugin, item: TAbstractFile) {
        const excerpt = await fetchExcerpt(plugin, item);
        setExcerpt(excerpt);
    }

}








