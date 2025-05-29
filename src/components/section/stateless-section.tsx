import classNames from 'classnames';
import './section.scss';
import * as React from "react";
import { Section } from 'src/logic/section-processes';
import { ListNoteCardSet } from '../list-note-card-set/list-note-card-set';
import { sortItemsByName } from 'src/utils/sorting';
import { StatelessQuickMenu } from '../section-quick-menu/stateless-quick-menu';

//////////
//////////

interface StatelessSectionProps {
    section: Section,
}

export const StatelessSection = (props: React.PropsWithChildren<StatelessSectionProps>) => {
    const sortedFiles = sortItemsByName(props.section.items, 'ascending');

    return <>
        <BaseSection
            key = {props.section.title}
            className = "ddc_pb_stateless-section"
            section = {props.section}
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