import { GoPrimitiveDot } from 'react-icons/go';
import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import {
    Coordinator, DataLoader, Highlightable, Icon, InputLine, SidebarSection,
} from '../Common';

class FavoriteTopicsSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = { logTopics: null, isHighlighted: {} };
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

    updateHighlight(logTopic, isHighlighted) {
        this.setState((state) => {
            state.isHighlighted[logTopic.id] = isHighlighted;
            return state;
        });
    }

    render() {
        if (this.state.logTopics === null) {
            return 'Loading ...';
        }
        return (
            <SidebarSection title="Favorite Topics">
                {this.state.logTopics.map((logTopic) => (
                    <Highlightable
                        key={logTopic.id}
                        isHighlighted={this.state.isHighlighted[logTopic.id] || false}
                        onChange={(isHighlighted) => this.updateHighlight(logTopic, isHighlighted)}
                    >
                        <InputGroup>
                            <Icon neverHighlighted className="mr-1">
                                <GoPrimitiveDot />
                            </Icon>
                            <InputLine styled={false}>
                                <a
                                    className="topic"
                                    href="#"
                                    onClick={() => Coordinator.invoke('details', logTopic)}
                                    tabIndex={-1}
                                >
                                    {logTopic.name}
                                </a>
                            </InputLine>
                        </InputGroup>
                    </Highlightable>
                ))}
            </SidebarSection>
        );
    }
}

export default FavoriteTopicsSection;
