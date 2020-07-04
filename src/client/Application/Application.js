import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import DataModeToggle from './DataModeToggle';
import { LogEntryDateList } from '../LogEntry';
import { LogStructureList } from '../LogStructure';
import { LogReminderSidebar, LogReminderGroupList } from '../LogReminder';
import { LogTopicSidebar, LogTopicGroupList, LogTopicDetails } from '../LogTopic';
import { ModalStack, combineClassNames } from '../Common';
import Enum from '../../common/Enum';


const [TabOptions, TabType, TabOptionsMap] = Enum([
    { label: 'Entries', value: 'log_entries', Component: LogEntryDateList },
    { label: 'Manage Structures', value: 'log_structures', Component: LogStructureList },
    { label: 'Manage Reminders', value: 'log_reminders', Component: LogReminderGroupList },
    { label: 'Manage Topics', value: 'log_topics', Component: LogTopicGroupList },
]);


class Applicaton extends React.Component {
    constructor(props) {
        super(props);
        this.state = { activeTab: TabType.LOG_ENTRIES };
    }

    render() {
        const { Component } = TabOptionsMap[this.state.activeTab];
        return (
            <Container fluid>
                <Row>
                    <Col md={2}>
                        {TabOptions.map((option) => (
                            <div
                                key={option.value}
                                className={combineClassNames({
                                    'tab-item': true,
                                    'tab-item-selected': this.state.activeTab === option.value,
                                })}
                                onClick={() => this.setState({ activeTab: option.value })}
                            >
                                {option.label}
                            </div>
                        ))}
                        <LogReminderSidebar />
                    </Col>
                    <Col md={4} className="mt-2">
                        <Component />
                    </Col>
                    <Col md={4} className="mt-2">
                        <LogTopicDetails />
                    </Col>
                    <Col md={2}>
                        <DataModeToggle />
                        <LogTopicSidebar />
                        <li>Exercise Graphs</li>
                        <li>Random Motivation Quotes.</li>
                        <li>Time since last backup.</li>
                        <li>Time since last consistency checks.</li>
                    </Col>
                </Row>
                <ModalStack />
            </Container>
        );
    }
}

export default Applicaton;
