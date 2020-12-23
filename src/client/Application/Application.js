import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import PropTypes from 'prop-types';
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
import FavoritesSection from './FavoritesSection';
import ModeSection from './ModeSection';
import TimeSection from './TimeSection';
import TopicSection from './TopicSection';
import TabSection from './TabSection';
import URLState from './URLState';
import { getSortComparator } from '../../data';


class Applicaton extends React.Component {
    constructor(props) {
        super(props);
        this.deregisterCallbacks = [
            URLState.init(),
            Coordinator.subscribe('url-change', (urlParams) => this.setState({ urlParams })),
        ];
        const urlParams = Coordinator.invoke('url-params');
        urlParams.tab = urlParams.tab || TabSection.Enum.LOG_EVENT;
        urlParams.layout = urlParams.layout || LayoutSection.Enum.DEFAULT;
        this.state = { urlParams, disabled: false };
        this.tabRef = React.createRef();
    }

    componentWillUnmount() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    renderRightSidebar({ showReminders }) {
        return (
            <Col md={2} className="my-3">
                <TimeSection
                    label="Time in India"
                    timezone="Asia/Kolkata"
                />
                <ModeSection
                    logMode={this.state.urlParams.mode}
                    disabled={this.state.disabled}
                    onChange={(mode) => Coordinator.invoke('url-update', { mode })}
                />
                <LayoutSection
                    value={this.state.urlParams.layout}
                    onChange={(layout) => Coordinator.invoke('url-update', { layout })}
                />
                <BackupSection />
                <ConsistencySection />
                {showReminders
                    ? this.props.rightSidebarTopicIds.map((id) => <TopicSection key={id} id={id} />)
                    : null}
                <FavoritesSection
                    title="Favorite Events"
                    dataType="log-event"
                    sortComparator={getSortComparator(['date', 'orderingIndex'])}
                    ViewerComponent={LogEventList.Single}
                    viewerComponentProps={{ viewerComponentProps: { displayDate: true } }}
                    valueKey="logEvent"
                />
                <FavoritesSection
                    title="Favorite Topics"
                    dataType="log-topic"
                    sortComparator={getSortComparator(['name'])}
                    ViewerComponent={LogTopicList.Single}
                    valueKey="logTopic"
                />
                <CreditsSection />
            </Col>
        );
    }

    renderDefaultLayout() {
        return (
            <Row>
                <Col md={2} className="my-3">
                    <ScrollableSection>
                        <TabSection
                            value={this.state.urlParams.tab}
                            onChange={(tab) => Coordinator.invoke('url-update', { tab })}
                            ref={this.tabRef}
                        />
                    </ScrollableSection>
                </Col>
                <Col md={4} className="my-3">
                    <IndexSection
                        Component={TabSection.Enum[this.state.urlParams.tab].Component}
                        logMode={this.state.urlParams.mode}
                        search={this.state.urlParams.search}
                        disabled={this.state.disabled}
                        onChange={(search) => Coordinator.invoke('url-update', { search })}
                    />
                </Col>
                <Col md={4} className="my-3">
                    <DetailsSection
                        logMode={this.state.urlParams.mode}
                        item={this.state.urlParams.details}
                        disabled={this.state.disabled}
                        onChange={(details) => Coordinator.invoke('url-update', { details })}
                    />
                </Col>
                {this.renderRightSidebar({ showReminders: false })}
            </Row>
        );
    }

    renderRemindersLayout() {
        return (
            <Row>
                <Col md={2} className="my-3">
                    <ScrollableSection>
                        <TabSection
                            value={this.state.urlParams.tab}
                            onChange={(tab) => Coordinator.invoke('url-update', { tab })}
                            ref={this.tabRef}
                        />
                        <ReminderSidebar
                            logMode={this.state.urlParams.mode}
                            disabled={this.state.disabled}
                        />
                    </ScrollableSection>
                </Col>
                <Col md={4} className="my-3">
                    <IndexSection
                        Component={TabSection.Enum[this.state.urlParams.tab].Component}
                        logMode={this.state.urlParams.mode}
                        search={this.state.urlParams.search}
                        disabled={this.state.disabled}
                        onChange={(search) => Coordinator.invoke('url-update', { search })}
                    />
                </Col>
                <Col md={4} className="my-3">
                    <DetailsSection
                        logMode={this.state.urlParams.mode}
                        item={this.state.urlParams.details}
                        disabled={this.state.disabled}
                        onChange={(details) => Coordinator.invoke('url-update', { details })}
                    />
                </Col>
                {this.renderRightSidebar({ showReminders: true })}
            </Row>
        );
    }

    renderTopicLayout() {
        return (
            <Row>
                <Col md={2} className="my-3">
                    <ScrollableSection>
                        <SidebarSection title="All Topics">
                            <LogTopicSearch search={this.state.urlParams.search} />
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
                {this.renderRightSidebar({ showReminders: false })}
            </Row>
        );
    }

    renderLayout() {
        const { layout } = this.state.urlParams;
        if (layout === LayoutSection.Enum.DEFAULT) {
            return this.renderDefaultLayout();
        } if (layout === LayoutSection.Enum.REMINDERS) {
            return this.renderRemindersLayout();
        } if (layout === LayoutSection.Enum.TOPIC) {
            return this.renderTopicLayout();
        }
        return <div>{`Unknown layout: ${layout}`}</div>;
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

Applicaton.propTypes = {
    rightSidebarTopicIds: PropTypes.arrayOf(PropTypes.number),
};

Applicaton.defaultProps = {
    rightSidebarTopicIds: [],
};

export default Applicaton;
