import classNames from 'classnames';
import './section.scss';
import * as React from "react";
import { Section } from 'src/logic/section-processes';
import { ListNoteCardSet } from '../list-note-card-set/list-note-card-set';
import { sortItemsByCreationDateAndPriority, sortItemsByModifiedDateAndPriority, sortItemsByName, sortItemsByNameAndPriority } from 'src/utils/sorting';
import { statelessSettingsAtom } from 'src/logic/stores';
import { useAtom } from 'jotai';
import { StateViewMode, StateViewOrder } from 'src/types/types-map';
import { StatelessQuickMenu } from '../section-quick-menu/stateless-quick-menu';
import { SmallNoteCardSet } from '../small-note-card-set/small-note-card-set';
import { DetailedNoteCardSet } from '../detailed-note-card-set/detailed-note-card-set';
import { SimpleNoteCardSet } from '../simple-note-card-set/simple-note-card-set';
import { TAbstractFile } from 'obsidian';

//////////
//////////

interface StatelessSectionProps {
    section: Section,
}

export const StatelessSection = (props: React.PropsWithChildren<StatelessSectionProps>) => {
    const [statelessSettings, setStatelessSettings] = useAtom(statelessSettingsAtom);
    const curStatelessSettings = statelessSettings || props.section.settings;
    
    
    let sortedFiles: TAbstractFile[] = [];
    if(curStatelessSettings?.defaultViewOrder === StateViewOrder.AliasOrFilename) {
        sortedFiles = sortItemsByNameAndPriority(props.section.items, 'ascending');
    } else if(curStatelessSettings?.defaultViewOrder === StateViewOrder.CreationDate) {
        sortedFiles = sortItemsByCreationDateAndPriority(props.section.items, 'descending');
    } else if(curStatelessSettings?.defaultViewOrder === StateViewOrder.ModifiedDate) {
        sortedFiles = sortItemsByModifiedDateAndPriority(props.section.items, 'descending');
    }

    return <>
        <BaseSection
            key = {curStatelessSettings.name}
            className = "ddc_pb_stateless-section"
            section = {props.section}
        >

            {curStatelessSettings.defaultViewMode === StateViewMode.DetailedCards && (
                <DetailedNoteCardSet
                    files = {sortedFiles}
                />
            )}

            {curStatelessSettings.defaultViewMode === StateViewMode.SimpleCards && (
                <SimpleNoteCardSet
                    files = {sortedFiles}
                />
            )}

            {curStatelessSettings.defaultViewMode === StateViewMode.SmallCards && (
                <SmallNoteCardSet
                    files = {sortedFiles}
                />
            )}

            {curStatelessSettings.defaultViewMode === StateViewMode.List && (
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
                <StatelessQuickMenu section = {props.section} />
            )}
        </div>
    </>
}); 