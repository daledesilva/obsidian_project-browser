import './simple-project-card.scss';
import { TFolder } from "obsidian";
import * as React from "react";
import { ProjectCardBase } from '../project-card-base/project-card-base';
import { getFolderDisplayName } from 'src/logic/get-folder-display-name';

/////////
/////////

interface SimpleProjectCardProps {
    folder: TFolder,
}

export const SimpleProjectCard = (props: SimpleProjectCardProps) => {
    const name = getFolderDisplayName(props.folder);
    const [articleRotation] = React.useState(Math.random() * 4 - 2);
    const [blurbRotation] = React.useState(Math.random() * 2 - 1);

    return (
        <ProjectCardBase
            folder={props.folder}
            className="ddc_pb_simple-project-card"
            rotation={articleRotation}
        >
            <h3 style={{ rotate: blurbRotation + 'deg' }}>
                {name}
            </h3>
        </ProjectCardBase>
    );
};
