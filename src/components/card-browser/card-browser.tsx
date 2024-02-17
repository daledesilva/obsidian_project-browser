import './card-browser.scss';
import * as React from "react";
import ProjectCardsPlugin from "src/main";
import { getSortedNotesInFolder } from "src/logic/get-files";
import { SectionHeader } from "../section-header/section-header";
import { CardSet } from "../card-set/card-set";

//////////
//////////

interface CardBrowserProps {
    plugin: ProjectCardsPlugin,
}

export const CardBrowser = (props: CardBrowserProps) => {
    // const [files, setFiles] = useState
    const v = props.plugin.app.vault;
    const [curFolder, setCurFolder] = React.useState( v.getRoot() );

    // on mount
    React.useEffect( () => {
        console.log("mounting");
    },[])

    // TODO: This should return an array of states with items
    const items = getSortedNotesInFolder(curFolder);
    
    return <>
        <div
            className = 'project-cards_browser'
        >

            {items && <>
                <SectionHeader title="Active"/>
                <CardSet items={items}/>
            </>}

            {items && <>
                <SectionHeader title="WIP"/>
                <CardSet items={items}/>
            </>}

            {items && <>
                <SectionHeader title="Seed"/>
                <CardSet items={items}/>
            </>}

        </div>
    </>;

};

//////////
//////////

export default CardBrowser;