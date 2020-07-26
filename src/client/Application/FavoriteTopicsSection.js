import React from 'react';
import { Coordinator, DataLoader, SidebarSection } from '../Common';

class FavoriteTopicsSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = { logTopics: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            name: 'log-topic-list',
            args: {
                selector: { on_sidebar: true },
            },
            callback: (logTopics) => this.setState({
                logTopics: logTopics.sort((left, right) => left.name.localeCompare(right.name)),
            }),
        });
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    render() {
        if (this.state.logTopics === null) {
            return 'Loading ...';
        }
        return (
            <SidebarSection title="Favorite Topics">
                {this.state.logTopics.map((logTopic) => (
                    <li key={logTopic.id}>
                        <a
                            href="#"
                            onClick={() => Coordinator.invoke('details', logTopic)}
                        >
                            {logTopic.name}
                        </a>
                    </li>
                ))}
            </SidebarSection>
        );
    }
}

export default FavoriteTopicsSection;
