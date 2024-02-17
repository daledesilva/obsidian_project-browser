import * as React from "react";
import './card-browser.scss';
import ProjectCardsPlugin from "src/main";
import { getSortedNotesInFolder } from "src/logic/get-files";

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

    const items = getSortedNotesInFolder(curFolder);
    
    console.log('folder items', items);


    return <>
        <div
            className = 'project-cards_browser'
        >

            <div
                className='project-cards_state-header'
            >
                <h2>
                    Active
                </h2>
            </div>

            <div
                className = 'project-cards_card-set'
            >
                <article
                    className='project-cards_card'
                >
                    <h3>
                        Title of note is a moderately long one
                    </h3>
                    <p>
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                    </p>
                </article>
                <article
                    className='project-cards_card'
                >
                    <h3>
                        Title of note
                    </h3>
                    <p>
                        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
                    </p>
                </article>
            </div>


            <div
                className='project-cards_state-header'
            >
                <h2>
                    WIP
                </h2>
            </div>

            <div
                className = 'project-cards_card-set'
            >
                <article
                    className='project-cards_card'
                >
                    <h3>
                        Title of note
                    </h3>
                    <p>
                        Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.
                    </p>
                </article>
                <article
                    className='project-cards_card'
                >
                    <h3>
                        Title of note
                    </h3>
                    <p>
                        Consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.
                    </p>
                </article>
                <article
                    className='project-cards_card'
                >
                    <h3>
                        This note has an exceptionally long title that spills over 3 lines and therefore should get clamped
                    </h3>
                    <p>
                        Nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
                    </p>
                </article>
            </div>

            <div
                className='project-cards_state-header'
            >
                <h2>
                    Seed
                </h2>
            </div>

            <div
                className = 'project-cards_card-set'
            >
                <article
                    className='project-cards_card'
                >
                    <h3>
                        Title of note is a moderately long one
                    </h3>
                    <p>
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                    </p>
                </article>
                <article
                    className='project-cards_card'
                >
                    <h3>
                        Title of note
                    </h3>
                    <p>
                        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
                    </p>
                </article>
                <article
                    className='project-cards_card'
                >
                    <h3>
                        Title of note
                    </h3>
                    <p>
                        Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.
                    </p>
                </article>
                <article
                    className='project-cards_card'
                >
                    <h3>
                        Title of note
                    </h3>
                    <p>
                        Consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.
                    </p>
                </article>
                <article
                    className='project-cards_card'
                >
                    <h3>
                        This note has an exceptionally long title that spills over 3 lines and therefore should get clamped
                    </h3>
                    <p>
                        Nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
                    </p>
                </article>
                <article
                    className='project-cards_card'
                >
                    <h3>
                        Title of note
                    </h3>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                </article>
            </div>

        </div>
    </>;

};

//////////
//////////

export default CardBrowser;