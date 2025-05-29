import classNames from 'classnames';
import './section.scss';
import * as React from "react";
import { Section } from 'src/logic/section-processes';
import { DetailedNoteCardSet } from '../detailed-note-card-set/detailed-note-card-set';
import { SimpleNoteCardSet } from '../simple-note-card-set/simple-note-card-set';
import { ListNoteCardSet } from '../list-note-card-set/list-note-card-set';
import { SmallNoteCardSet } from '../small-note-card-set/small-note-card-set';
import { sortItemsByNameAndPriority } from 'src/utils/sorting';
import { registerStateSectionContextMenu } from 'src/context-menus/state-section-context-menu';
import { CardBrowserContext } from '../card-browser/card-browser';
import { getGlobals } from 'src/logic/stores';
import { StateViewMode } from 'src/types/types-map';
import { StateQuickMenu } from '../section-quick-menu/state-quick-menu';

//////////
//////////

interface StateSectionProps {
    section: Section,
}

export const StateSection = (props: React.PropsWithChildren<StateSectionProps>) => {
    const {plugin} = getGlobals();
    const cardBrowserContext = React.useContext(CardBrowserContext);
    const sectionRef = React.useRef(null);

    React.useEffect( () => {
        if(!plugin) return;
        if(!cardBrowserContext.folder) return;
        
        if(sectionRef.current) {
            registerStateSectionContextMenu(sectionRef.current, cardBrowserContext.folder, props.section.title, {});
        }
    })

    const sortedFiles = sortItemsByNameAndPriority(props.section.items, 'ascending');

    return <>
        <BaseSection
            ref = {sectionRef}
            key = {props.section.title}
            className = "ddc_pb_state-section"
            section = {props.section}
        >
            <SectionHeader>
                {props.section.title}
            </SectionHeader>

            {props.section.settings.defaultViewMode === StateViewMode.DetailedCards && (
                <DetailedNoteCardSet
                    files = {sortedFiles}
                />
            )}

            {props.section.settings.defaultViewMode === StateViewMode.SimpleCards && (
                <SimpleNoteCardSet
                    files = {sortedFiles}
                />
            )}

            {props.section.settings.defaultViewMode === StateViewMode.SmallCards && (
                <SmallNoteCardSet
                    files = {sortedFiles}
                />
            )}

            {props.section.settings.defaultViewMode === StateViewMode.List && (
                <ListNoteCardSet
                    files = {sortedFiles}
                />
            )}
        </BaseSection>
    </>
}

///////

interface BaseSectionProps extends React.PropsWithChildren {
    className?: string
    showQuickMenu?: boolean
    section: Section
}

const BaseSection = React.forwardRef<HTMLDivElement, BaseSectionProps>((props, ref) => {
    const {
        showQuickMenu = true
    } = props;

    return <>
        <div
            ref = {ref}
            className = {classNames([
                'ddc_pb_section',
                props.className && props.className
            ])}
        >
            {props.children}

            {showQuickMenu && (
                <StateQuickMenu section = {props.section} />
            )}
        </div>
    </>
});

///////

interface SectionHeaderProps {}

const SectionHeader = (props: React.PropsWithChildren<SectionHeaderProps>) => {
    return <>
        <div
            className = 'ddc_pb_section-header'
        >
            <h2>
                {props.children}
            </h2>
        </div>
    </>
}; 