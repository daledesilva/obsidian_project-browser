import classNames from 'classnames';
import './section.scss';
import * as React from "react";
import { Section } from 'src/logic/section-processes';
import { TFile, TFolder } from 'obsidian';
import { FolderButtonSet } from '../folder-button-set/folder-button-set';
import { DetailedNoteCardSet } from '../detailed-note-card-set/detailed-note-card-set';
import { SimpleNoteCardSet } from '../simple-note-card-set/simple-note-card-set';
import { ListNoteCardSet } from '../list-note-card-set/list-note-card-set';
import { SmallNoteCardSet } from '../small-note-card-set/small-note-card-set';
import { StateViewMode_0_0_5 } from 'src/types/plugin-settings0_0_5';
import { sortItemsAlphabetically } from 'src/utils/sorting';
import { registerStateSectionContextMenu } from 'src/context-menus/state-section-context-menu';
import { CardBrowserContext } from '../card-browser/card-browser';
import { getGlobals } from 'src/logic/stores';
import { SearchInput } from '../search-input/search-input';

//////////
//////////

interface FolderSectionProps {
    section: Section,
}
export const FolderSection = (props: FolderSectionProps) => {

    const sortedFolders = sortItemsAlphabetically(props.section.items, 'ascending');

    return <>
        <BaseSection
            key = {props.section.title}
            className = "ddc_pb_folder-section"
        >
            <FolderButtonSet
                folders = {sortedFolders}
            />
        </BaseSection>
    </>
}

///////

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
            registerStateSectionContextMenu(sectionRef.current, cardBrowserContext.folder, props.section.title, {openFile: cardBrowserContext.openFile});
        }
    })

    const sortedFiles = sortItemsAlphabetically(props.section.items, 'ascending');

    return <>
        <BaseSection
            ref = {sectionRef}
            key = {props.section.title}
            className = "ddc_pb_state-section"
        >
            <SectionHeader>
                {props.section.title}
            </SectionHeader>

            {props.section.settings.defaultView === StateViewMode_0_0_5.DetailedCards && (
                <DetailedNoteCardSet
                    files = {sortedFiles}
                />
            )}

            {props.section.settings.defaultView === StateViewMode_0_0_5.SimpleCards && (
                <SimpleNoteCardSet
                    files = {sortedFiles}
                />
            )}

            {props.section.settings.defaultView === StateViewMode_0_0_5.SmallCards && (
                <SmallNoteCardSet
                    files = {sortedFiles}
                />
            )}

            {props.section.settings.defaultView === StateViewMode_0_0_5.List && (
                <ListNoteCardSet
                    files = {sortedFiles}
                />
            )}
        </BaseSection>
    </>
}

///////

interface StatelessSectionProps {
    section: Section,
}
export const StatelessSection = (props: React.PropsWithChildren<StatelessSectionProps>) => {
    const sortedFiles = sortItemsAlphabetically(props.section.items, 'ascending');

    return <>
        <BaseSection
            key = {props.section.title}
            className = "ddc_pb_stateless-section"
        >
            <ListNoteCardSet
                files = {sortedFiles}
            />
        </BaseSection>
    </>
}

///////

interface BaseSectionProps extends React.PropsWithChildren {
    className?: string
}
const BaseSection = React.forwardRef<HTMLDivElement, BaseSectionProps>((props, ref) => {

    return <>
        <div
            ref = {ref}
            className = {classNames([
                'ddc_pb_section',
                props.className && props.className
            ])}
        >
            {props.children}
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