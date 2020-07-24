import React from 'react';
import { Coordinator, DataLoader, LeftRight } from '../Common';

class BackupSidebar extends React.Component {
    static onClick() {
        window.api.send('backup-save')
            .then(({ isUnchanged }) => Coordinator.invoke('modal-error', isUnchanged ? 'Backup unchanged!' : 'Backup complete!'));
    }

    constructor(props) {
        super(props);
        this.state = { latestBackup: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            name: 'backup-latest',
            callback: (latestBackup) => this.setState({ latestBackup }),
        });
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    render() {
        const { latestBackup } = this.state;
        return (
            <LeftRight className="tab-item">
                <a href="#" onClick={() => BackupSidebar.onClick()}>Backup</a>
                {latestBackup ? `${latestBackup.timetamp}` : 'No backup found!' }
            </LeftRight>
        );
    }
}

export default BackupSidebar;
