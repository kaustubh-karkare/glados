import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import BackupSidebar from './BackupSidebar';
import { LogEventSelectorList } from '../LogEvent';
import { LogStructureGroupList } from '../LogStructure';
import { ReminderSidebar } from '../Reminders';
import { LogTopicSidebar, LogTopicList } from '../LogTopic';
import { ModalStack, ScrollableSection, combineClassNames } from '../Common';
import DetailsSection from './DetailsSection';
import Enum from '../../common/Enum';


const [TabOptions, TabType, TabOptionsMap] = Enum([
    {
        label: 'Manage Events',
        value: 'log_events',
        Component: LogEventSelectorList,
    },
    {
        label: 'Manage Structures',
        value: 'log_structures',
        Component: LogStructureGroupList,
    },
    {
        label: 'Manage Topics',
        value: 'log_topics',
        Component: LogTopicList,
        componentProps: { selector: { parent_topic_id: null, has_structure: false } },
    },
]);


class Applicaton extends React.Component {
    constructor(props) {
        super(props);
        this.state = { activeTab: TabType.LOG_EVENTS };
    }

    render() {
        const { Component, componentProps } = TabOptionsMap[this.state.activeTab];
        return (
            <Container fluid>
                <Row>
                    <Col md={2} className="my-3">
                        <ScrollableSection>
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
                            <ReminderSidebar />
                        </ScrollableSection>
                    </Col>
                    <Col md={4} className="my-3">
                        <ScrollableSection>
                            <Component {...componentProps} />
                        </ScrollableSection>
                    </Col>
                    <Col md={4} className="my-3">
                        <ScrollableSection>
                            <DetailsSection />
                        </ScrollableSection>
                    </Col>
                    <Col md={2} className="my-3">
                        <BackupSidebar />
                        <LogTopicSidebar />
                    </Col>
                </Row>
                <ModalStack />
            </Container>
        );
    }
}

export default Applicaton;
