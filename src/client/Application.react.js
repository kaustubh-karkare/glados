import React from 'react';
import {CategoryList} from './Category.react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

const TabKeys = {
    LOG_ENTRIES: "log_entries",
    CATEGORIES: "categories",
    LSD_KEYS: "lsd_keys",
};

class Applicaton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {activeTab: TabKeys.CATEGORIES};
    }
    render() {
        return (
            <Container fluid={true}>
                <Row>
                    <Col md={2}>
                        {'Left'}
                    </Col>
                    <Col md={8} className="mt-2">
                        <Tabs
                            activeKey={this.state.activeTab}
                            onSelect={activeTab => this.setState({activeTab})}>
                            <Tab eventKey={TabKeys.LOG_ENTRIES} title="Entries">
                                {'Log Entries'}
                            </Tab>
                            <Tab eventKey={TabKeys.CATEGORIES} title="Categories">
                                <CategoryList />
                            </Tab>
                            <Tab eventKey={TabKeys.LSD_KEYS} title="Keys">
                                {'LSD Keys'}
                            </Tab>
                        </Tabs>
                    </Col>
                    <Col md={2}>
                        {'Right'}
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Applicaton;
