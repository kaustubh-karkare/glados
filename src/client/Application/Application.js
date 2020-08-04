import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import React from 'react';
import Row from 'react-bootstrap/Row';
import {
    Coordinator, ModalStack, ScrollableSection, SidebarSection, URLManager,
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
        value: 'log-event',
        Component: LogEventSearch,
    },
    {
        label: 'Manage Topics',
        value: 'log-topic',
        Component: LogTopicSearch,
    },
    {
        label: 'Manage Structures',
        value: 'log-structure',
        Component: LogStructureSearch,
    },
]);

window.Tab = Tab;

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

/**
 * [...Array(128).keys()]
 *     .map(code => String.fromCharCode(code))
 *     .filter(char => !char.match(/\w/) && char === encodeURIComponent(char))
 * ["!", "'", "(", ")", "*", "-", ".", "~"]
 * Picked the one most easily readable in the URL.
 */
const SEPARATOR = '~';

class Applicaton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...this.getStateFromURL(),
            disabled: false,
        };
        this.deregisterCallbacks = [
            URLManager.init(() => this.setState(this.getStateFromURL())),
            Coordinator.register('link-href', this.getLinkHref.bind(this)),
            Coordinator.register('details', this.onDetailsChange.bind(this)),
            Coordinator.register('layout-options', () => Layout.Options),
            Coordinator.register('layout', this.onLayoutChange.bind(this)),
        ];
    }

    componentWillUnmount() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    onTabChange(activeTab) {
        this.setURLFromState({ activeTab, activeLayout: Layout.DEFAULT });
    }

    onLayoutChange(activeLayout) {
        this.setURLFromState({ activeLayout });
    }

    onDetailsChange(item) {
        if (!item || item.__type__ === 'log-topic' || item.__type__ === 'log-event') {
            this.setURLFromState({ activeDetails: item });
        } else if (item.__type__ === 'log-structure') {
            this.setURLFromState({ activeDetails: item.logTopic });
        } else {
            Coordinator.invoke(
                'modal-error',
                `${JSON.stringify(item, null, 4)}\n\nThis item does support details!`,
            );
        }
    }

    // Synchronization of URL Parameters with Component State.

    getLinkHref({ activeTab, activeLayout, activeDetails }) {
        let item = activeDetails;
        if (typeof activeDetails === 'undefined') {
            item = this.state.activeDetails;
        }
        return URLManager.getLink({
            tab: activeTab || this.state.activeTab,
            layout: activeLayout || this.state.activeLayout,
            details: item ? `${item.__type__}${SEPARATOR}${item.id}` : null,
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getStateFromURL() {
        const params = URLManager.get();
        let activeDetails = null;
        if (params.details) {
            const [__type__, id] = params.details.split(SEPARATOR);
            activeDetails = { __type__, id: parseInt(id, 10) };
        }
        return {
            activeTab: params.tab || Tab.LOG_EVENT,
            activeLayout: params.layout || Layout.DEFAULT,
            activeDetails,
        };
    }

    setURLFromState(params) {
        const linkHref = this.getLinkHref(params);
        URLManager.update(linkHref);
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
                        item={this.state.activeDetails}
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
                        item={this.state.activeDetails}
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
