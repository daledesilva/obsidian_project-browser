import './detailed-project-card.scss';
import { TFolder } from "obsidian";
import * as React from "react";
import { getProjectExcerpt } from "src/logic/folder-processes";
import { ProjectCardBase } from '../project-card-base/project-card-base';

/////////
/////////

interface DetailedProjectCardProps {
    folder: TFolder,
}

export const DetailedProjectCard = (props: DetailedProjectCardProps) => {
    const name = props.folder.name;
    const [excerpt, setExcerpt] = React.useState('');
    const [articleRotation] = React.useState(Math.random() * 4 - 2);
    const [titleRotation] = React.useState(Math.random() * 2 - 1);
    const [blurbRotation] = React.useState(Math.random() * 2 - 1);

    React.useEffect(() => {
        void getProjectExcerpt(props.folder).then((excerptText) => {
            if (excerptText) setExcerpt(excerptText);
        });
    }, []);

    return (
        <ProjectCardBase
            folder={props.folder}
            className="ddc_pb_detailed-project-card"
            rotation={articleRotation}
        >
            <h3 style={{ rotate: titleRotation + 'deg' }}>
                {name}
            </h3>
            <p style={{ rotate: blurbRotation + 'deg' }}>
                {excerpt}
            </p>
        </ProjectCardBase>
    );
};
