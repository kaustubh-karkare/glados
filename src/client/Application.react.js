import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { LogEntryList } from './LogEntry';
import { LogStructureList } from './LogStructure';
import { LogKeyList } from './LogKey';
import { LogTagList } from './LogTag';

const TabKeys = {
    LOG_ENTRIES: 'log_entries',
    LOG_STRUCTURES: 'log_structures',
    LOG_KEYS: 'log_keys',
    LOG_TAGS: 'log_tags',
};

class Applicaton extends React.Component {
    constructor(props) {
        super(props);
        this.state = { activeTab: TabKeys.LOG_ENTRIES };
    }

    render() {
        return (
            <Container fluid>
                <Row>
                    <Col md={2}>
                        <li>Project List</li>
                        <li>Todo Items</li>
                    </Col>
                    <Col md={8} className="mt-2">
                        <Tabs
                            activeKey={this.state.activeTab}
                            onSelect={(activeTab) => this.setState({ activeTab })}
                        >
                            <Tab eventKey={TabKeys.LOG_ENTRIES} title="Entries">
                                <LogEntryList />
                            </Tab>
                            <Tab eventKey={TabKeys.LOG_STRUCTURES} title="Structures">
                                <LogStructureList />
                            </Tab>
                            <Tab eventKey={TabKeys.LOG_KEYS} title="Keys">
                                <LogKeyList />
                            </Tab>
                            <Tab eventKey={TabKeys.LOG_TAGS} title="Tags">
                                <LogTagList />
                            </Tab>
                        </Tabs>
                    </Col>
                    <Col md={2}>
                        <li>Exercise Graphs</li>
                        <li>Random Motivation Quotes.</li>
                        <li>Time since last backup.</li>
                        <li>Time since last consistency checks.</li>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Applicaton;
