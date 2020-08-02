import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import React from 'react';
import Row from 'react-bootstrap/Row';
import {
    Coordinator, ModalStack, ScrollableSection, SidebarSection,
} from '../Common';
import { LogEventSearch } from '../LogEvent';
import { LogStructureSearch } from '../LogStructure';
import { LogTopicSearch } from '../LogTopic';
import { ReminderSidebar } from '../Reminders';
import BackupSection from './BackupSection';
import ConsistencySection from './ConsistencySection';
import CreditsSection from './CreditsSection';
import DetailsSection from './DetailsSection';
import Enum from '../../common/Enum';
import FavoriteTopicsSection from './FavoriteTopicsSection';
import IndexSection from './IndexSection';
import LayoutSection from './LayoutSection';


const Tab = Enum([
    {
        label: 'Manage Events',
        value: 'log_events',
        Component: LogEventSearch,
    },
    {
        label: 'Manage Topics',
        value: 'log_topics',
        Component: LogTopicSearch,
    },
    {
        label: 'Manage Structures',
        value: 'log_structures',
        Component: LogStructureSearch,
    },
]);

const Layout = Enum([
    {
        label: 'Default',
        value: 'default',
    },
    {
        label: 'Topic',
        value: 'topic',
    },
]);


class Applicaton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: Tab.LOG_EVENTS,
            activeLayout: Layout.DEFAULT,
            activeItem: null,
            disabled: false,
        };
        this.deregisterCallbacks = [
            Coordinator.register('details', this.onDetailsChange.bind(this)),
            Coordinator.register('layout-options', () => Layout.Options),
            Coordinator.register('layout', (activeLayout) => this.setState({ activeLayout })),
        ];
    }

    componentWillUnmount() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    onTabChange(tab) {
        this.setState({ activeTab: tab, activeLayout: Layout.DEFAULT });
    }

    onDetailsChange(item) {
        if (!item || item.__type__ === 'log-topic' || item.__type__ === 'log-event') {
            this.setState({ activeItem: item });
        } else if (item.__type__ === 'log-structure') {
            this.setState({ activeItem: item.logTopic });
        } else {
            Coordinator.invoke(
                'modal-error',
                `${JSON.stringify(item, null, 4)}\n\nThis item does support details!`,
            );
        }
    }

    renderTabSection() {
        return Tab.Options.map((option) => (
            <SidebarSection
                key={option.value}
                onClick={() => this.onTabChange(option.value)}
                selected={
                    this.state.activeTab === option.value
                    && this.state.activeLayout === Layout.DEFAULT
                }
            >
                {option.label}
            </SidebarSection>
        ));
    }

    renderRightSidebar() {
        return (
            <Col md={2} className="my-3">
                <LayoutSection layout={this.state.activeLayout} />
                <BackupSection />
                <ConsistencySection />
                <FavoriteTopicsSection />
                <CreditsSection />
            </Col>
        );
    }

    renderDefaultLayout() {
        const { Component } = Tab[this.state.activeTab];
        return (
            <Row>
                <Col md={2} className="my-3">
                    <ScrollableSection>
                        {this.renderTabSection()}
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
                        item={this.state.activeItem}
                        disabled={this.state.disabled}
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
                            <LogTopicSearch unstyled />
                        </SidebarSection>
                    </ScrollableSection>
                </Col>
                <Col md={8} className="my-3">
                    <DetailsSection
                        item={this.state.activeItem}
                        disabled={this.state.disabled}
                    />
                </Col>
                {this.renderRightSidebar()}
            </Row>
        );
    }

    renderLayout() {
        if (this.state.activeLayout === Layout.DEFAULT) {
            return this.renderDefaultLayout();
        } if (this.state.activeLayout === Layout.TOPIC) {
            return this.renderTopicLayout();
        }
        return <div>{`Unknown layout: ${this.state.activeLayout}`}</div>;
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
