import React from 'react';

import {
    Coordinator, DataLoader, LeftRight, SidebarSection,
} from '../Common';

class BackupSection extends React.Component {
    static onClick() {
        window.api.send('backup-save')
            .then(({ isUnchanged }) => Coordinator.invoke('modal-info', {
                title: 'Backup',
                message: isUnchanged ? 'Backup unchanged!' : 'Backup complete!',
            }));
    }

    constructor(props) {
        super(props);
        this.state = { latestBackup: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            getInput: () => ({
                name: 'backup-latest',
            }),
            onData: (latestBackup) => this.setState({ latestBackup }),
        });
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    render() {
        const { latestBackup } = this.state;
        return (
            <SidebarSection>
                <LeftRight>
                    <a href="#" onClick={() => BackupSection.onClick()}>Backup</a>
                    {latestBackup ? `${latestBackup.timetamp}` : 'No backup found!' }
                </LeftRight>
            </SidebarSection>
        );
    }
}

export default BackupSection;
