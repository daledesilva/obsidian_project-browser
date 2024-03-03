import './md-file-card.scss';
import { TFile } from "obsidian";
import * as React from "react";
import { getFileExcerpt } from "src/logic/file-processes";
import { trimFilenameExt } from 'src/logic/string-processes';
import { PluginContext } from 'src/utils/plugin-context';

/////////
/////////

interface MdFileCardProps {
    file: TFile,
    onSelect: (file: TFile) => void,
}

export const MdFileCard = (props: MdFileCardProps) => {
    const v = props.file.vault;
    const plugin = React.useContext(PluginContext);

    const name = trimFilenameExt(props.file.name);
    const [excerpt, setExcerpt] = React.useState('');

    React.useEffect( () => {
        if(!plugin) return;
        getExcerpt(props.file);
    }, [])
    
    return <>
        <article
            className = 'project-cards_file-card'
            onClick = { () => {
                props.onSelect(props.file)
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

    async function getExcerpt(file: TFile) {
        const excerpt = await getFileExcerpt(file);
        if(!excerpt) return;
        setExcerpt(excerpt);
    }

}








