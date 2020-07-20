import React from 'react';
import { DataLoader, LeftRight } from '../Common';

class BackupSidebar extends React.Component {
    static onClick() {
        window.api.send('backup-save')
            .then(({ isUnchanged }) => window.modalStack_displayError(isUnchanged ? 'Backup unchanged!' : 'Backup complete!'))
            .catch((error) => window.modalStack_displayError(error));
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
