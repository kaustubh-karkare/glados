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
        label: 'Focus',
        value: 'focus',
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
        this.setState({ activeItem: item });
    }

    renderLeftSidebar() {
        return (
            <Col md={2} className="my-3">
                <ScrollableSection>
                    {Tab.Options.map((option) => (
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
                    ))}
                    <ReminderSidebar />
                </ScrollableSection>
            </Col>
        );
    }

    renderLayout() {
        const { Component } = Tab[this.state.activeTab];
        if (this.state.activeLayout === Layout.DEFAULT) {
            return (
                <>
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
                </>
            );
        } if (this.state.activeLayout === Layout.FOCUS) {
            return (
                <Col md={8} className="my-3">
                    <DetailsSection
                        item={this.state.activeItem}
                        disabled={this.state.disabled}
                    />
                </Col>
            );
        }
        return <div>{`Unknown layout: ${this.state.activeLayout}`}</div>;
    }

    // eslint-disable-next-line class-methods-use-this
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

    render() {
        return (
            <Container fluid>
                <Row>
                    {this.renderLeftSidebar()}
                    {this.renderLayout()}
                    {this.renderRightSidebar()}
                </Row>
                <ModalStack />
            </Container>
        );
    }
}

export default Applicaton;
