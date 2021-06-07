import React from 'react';
import { DataLoader, Link, SidebarSection } from '../Common';

class ConversationRemindersSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = { items: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            getInput: () => ({
                name: 'conversation-reminders',
                args: { where: {} },
            }),
            onData: (items) => this.setState({ items }),
        });
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    renderContents() {
        const { items } = this.state;
        if (!items) {
            return 'Loading ...';
        }
        return items.map(({ logTopic, dayCount }) => (
            <SidebarSection.Item key={logTopic.id}>
                <Link logTopic={logTopic}>{logTopic.name}</Link>
                {dayCount ? <span className="ml-1">{`(${dayCount} days)`}</span> : null}
            </SidebarSection.Item>
        ));
    }

    render() {
        return (
            <SidebarSection title="Conversation Reminders">
                {this.renderContents()}
            </SidebarSection>
        );
    }
}

export default ConversationRemindersSection;
