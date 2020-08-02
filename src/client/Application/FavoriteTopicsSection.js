import React from 'react';
import { DataLoader, SidebarSection } from '../Common';
import { LogTopicList } from '../LogTopic';


class FavoriteTopicsSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = { logTopics: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            getInput: () => ({
                name: 'log-topic-list',
                args: {
                    where: { on_sidebar: true },
                },
            }),
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
                    <LogTopicList.Single key={logTopic.id} logTopic={logTopic} />
                ))}
            </SidebarSection>
        );
    }
}

export default FavoriteTopicsSection;
