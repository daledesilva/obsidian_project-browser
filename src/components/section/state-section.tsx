import classNames from 'classnames';
import './section.scss';
import * as React from "react";
import { Section } from 'src/logic/section-processes';
import { DetailedNoteCardSet } from '../detailed-note-card-set/detailed-note-card-set';
import { SimpleNoteCardSet } from '../simple-note-card-set/simple-note-card-set';
import { ListNoteCardSet } from '../list-note-card-set/list-note-card-set';
import { SmallNoteCardSet } from '../small-note-card-set/small-note-card-set';
import { sortItems, sortItemsByCreationDateAndPriority, sortItemsByModifiedDateAndPriority, sortItemsByNameAndPriority } from 'src/utils/sorting';
import { registerStateSectionContextMenu } from 'src/context-menus/state-section-context-menu';
import { CardBrowserContext } from '../card-browser/card-browser';
import { getGlobals, stateSettingsByNameAtom } from 'src/logic/stores';
import { StateViewMode, StateViewOrder } from 'src/types/types-map';
import { StateQuickMenu } from '../section-quick-menu/state-quick-menu';
import { useAtom, useAtomValue } from 'jotai';
import { TAbstractFile } from 'obsidian';

//////////
//////////

interface StateSectionProps {
    section: Section,
}

export const StateSection = (props: React.PropsWithChildren<StateSectionProps>) => {
    const {plugin} = getGlobals();
    const cardBrowserContext = React.useContext(CardBrowserContext);
    const sectionRef = React.useRef(null);
    
    // Memoize the atom to prevent infinite re-renders
    const stateSettingsAtom = React.useMemo(() => 
        stateSettingsByNameAtom(props.section.title), 
        [props.section.title]
    );
    
    const stateSettings = useAtomValue(stateSettingsAtom);
    // console.log('stateSettings', stateSettings);

    const curStateSettings = stateSettings || props.section.settings;

    React.useEffect( () => {
        if(!plugin) return;
        if(!cardBrowserContext.folder) return;
        
        if(sectionRef.current) {
            registerStateSectionContextMenu(sectionRef.current, cardBrowserContext.folder, curStateSettings.name, {});
        }
    })

    const sortedFiles = sortItems(props.section.items, curStateSettings);

    return <>
        <BaseSection
            ref = {sectionRef}
            key = {curStateSettings.name}
            className = "ddc_pb_state-section"
            section = {props.section}
        >
            <SectionHeader>
                {curStateSettings.name}
            </SectionHeader>

            {curStateSettings.defaultViewMode === StateViewMode.DetailedCards && (
                <DetailedNoteCardSet
                    files = {sortedFiles}
                />
            )}

            {curStateSettings.defaultViewMode === StateViewMode.SimpleCards && (
                <SimpleNoteCardSet
                    files = {sortedFiles}
                />
            )}

            {curStateSettings.defaultViewMode === StateViewMode.SmallCards && (
                <SmallNoteCardSet
                    files = {sortedFiles}
                />
            )}

            {curStateSettings.defaultViewMode === StateViewMode.List && (
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
                <StateQuickMenu section={props.section} />
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