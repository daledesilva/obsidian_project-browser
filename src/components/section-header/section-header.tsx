import './section-header.scss';
import * as React from "react";

//////////
//////////

interface SectionHeaderProps {
    title: string
}

export const SectionHeader = (props: SectionHeaderProps) => {

    return <>
        <div
            className = 'project-browser_section-header'
        >
            <h2>
                {props.title}
            </h2>
        </div>
    </>
}