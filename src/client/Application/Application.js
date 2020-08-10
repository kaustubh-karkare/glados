import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import React from 'react';
import Row from 'react-bootstrap/Row';
import {
    Coordinator, ModalStack, ScrollableSection, SidebarSection,
} from '../Common';
import { LogEventList } from '../LogEvent';
import { LogTopicList, LogTopicSearch } from '../LogTopic';
import { ReminderSidebar } from '../Reminders';
import BackupSection from './BackupSection';
import ConsistencySection from './ConsistencySection';
import CreditsSection from './CreditsSection';
import DetailsSection from './DetailsSection';
import IndexSection from './IndexSection';
import LayoutSection from './LayoutSection';
import SidebarItemsSection from './SidebarItemsSection';
import TabSection from './TabSection';
import URLState from './URLState';


class Applicaton extends React.Component {
    constructor(props) {
        super(props);
        this.deregisterCallbacks = [
            URLState.init(),
            Coordinator.subscribe('url-change', (urlParams) => this.setState({ urlParams })),
        ];
        this.state = {
            urlParams: Coordinator.invoke('url-params'),
            disabled: false,
        };
        this.tabRef = React.createRef();
    }

    componentWillUnmount() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    renderRightSidebar() {
        return (
            <Col md={2} className="my-3">
                <LayoutSection
                    value={this.state.urlParams.layout}
                    onChange={(layout) => Coordinator.invoke('url-update', { layout })}
                />
                <BackupSection />
                <ConsistencySection />
                <SidebarItemsSection
                    title="Favorite Events"
                    dataType="log-event"
                    ViewerComponent={LogEventList.Single}
                    valueKey="logEvent"
                />
                <SidebarItemsSection
                    title="Favorite Topics"
                    dataType="log-topic"
                    ViewerComponent={LogTopicList.Single}
                    valueKey="logTopic"
                />
                <CreditsSection />
            </Col>
        );
    }

    renderDefaultLayout() {
        const Component = TabSection.getComponent(this.state.urlParams.tab);
        return (
            <Row>
                <Col md={2} className="my-3">
                    <ScrollableSection>
                        <TabSection
                            value={this.state.urlParams.tab}
                            onChange={(tab) => Coordinator.invoke('url-update', { tab })}
                            ref={this.tabRef}
                        />
                        <ReminderSidebar />
                    </ScrollableSection>
                </Col>
                <Col md={4} className="my-3">
                    <IndexSection>
                        <Component disabled={this.state.disabled} />
                    </IndexSection>
                </Col>
                <Col md={4} className="my-3">
                    <DetailsSection
                        item={this.state.urlParams.details}
                        disabled={this.state.disabled}
                        onChange={(details) => Coordinator.invoke('url-update', { details })}
                    />
                </Col>
                {this.renderRightSidebar()}
            </Row>
        );
    }

    renderTopicLayout() {
        return (
            <Row>
                <Col md={2} className="my-3">
                    <ScrollableSection>
                        <SidebarSection title="All Topics">
                            <LogTopicSearch unstyled disabled={this.state.disabled} />
                        </SidebarSection>
                    </ScrollableSection>
                </Col>
                <Col md={8} className="my-3">
                    <DetailsSection
                        item={this.state.urlParams.details}
                        disabled={this.state.disabled}
                        onChange={(details) => Coordinator.invoke('url-update', { details })}
                    />
                </Col>
                {this.renderRightSidebar()}
            </Row>
        );
    }

    renderLayout() {
        if (this.state.urlParams.layout === LayoutSection.Enum.DEFAULT) {
            return this.renderDefaultLayout();
        } if (this.state.urlParams.layout === LayoutSection.Enum.TOPIC) {
            return this.renderTopicLayout();
        }
        return <div>{`Unknown layout: ${this.state.urlParams.layout}`}</div>;
    }

    render() {
        return (
            <Container fluid>
                {this.renderLayout()}
                <ModalStack />
            </Container>
        );
    }
}

export default Applicaton;
