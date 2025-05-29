import classNames from 'classnames';
import './section.scss';
import * as React from "react";
import { Section } from 'src/logic/section-processes';
import { ListNoteCardSet } from '../list-note-card-set/list-note-card-set';
import { sortItemsByName, sortItemsByNameAndPriority } from 'src/utils/sorting';
import { statelessSettingsAtom } from 'src/logic/stores';
import { useAtom } from 'jotai';
import { StateViewMode } from 'src/types/types-map';
import { StatelessQuickMenu } from '../section-quick-menu/stateless-quick-menu';
import { SmallNoteCardSet } from '../small-note-card-set/small-note-card-set';
import { DetailedNoteCardSet } from '../detailed-note-card-set/detailed-note-card-set';
import { SimpleNoteCardSet } from '../simple-note-card-set/simple-note-card-set';

//////////
//////////

interface StatelessSectionProps {
    section: Section,
}

export const StatelessSection = (props: React.PropsWithChildren<StatelessSectionProps>) => {
    const [statelessSettings, setStatelessSettings] = useAtom(statelessSettingsAtom);
    const curStatelessSettings = statelessSettings || props.section.settings;
    const sortedFiles = sortItemsByName(props.section.items, 'ascending');

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