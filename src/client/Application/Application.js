import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import PropTypes from 'prop-types';
import React from 'react';
import Row from 'react-bootstrap/Row';
import {
    Coordinator, EnumSelectorSection, ModalStack, ScrollableSection,
} from '../Common';
import { LogEventList } from '../LogEvent';
import { LogStructureList } from '../LogStructure';
import { LogTopicList } from '../LogTopic';
import { ReminderSidebar, TopicRemindersSection } from '../Reminders';
import BackupSection from './BackupSection';
import ConsistencySection from './ConsistencySection';
import CreditsSection from './CreditsSection';
import DetailsSection from './DetailsSection';
import IndexSection from './IndexSection';
import FavoritesSection from './FavoritesSection';
import ModeSection from './ModeSection';
import TimeSection from './TimeSection';
import TopicSection from './TopicSection';
import TabSection from './TabSection';
import URLState from './URLState';
import Enum from '../../common/Enum';


const Layout = Enum([
    {
        label: 'Split',
        value: 'split',
    },
    {
        label: 'Left',
        value: 'left',
    },
    {
        label: 'Right',
        value: 'right',
    },
]);


const Widgets = Enum([
    {
        label: 'Show',
        value: 'show',
    },
    {
        label: 'Hide',
        value: 'hide',
    },
]);


class Applicaton extends React.Component {
    constructor(props) {
        super(props);
        this.deregisterCallbacks = [
            URLState.init(),
            Coordinator.subscribe('url-change', (urlParams) => this.setState({ urlParams })),
        ];
        const urlParams = Coordinator.invoke('url-params');
        urlParams.tab = urlParams.tab || TabSection.Enum.LOG_EVENT;
        urlParams.layout = urlParams.layout || Layout.SPLIT;
        urlParams.widgets = urlParams.widgets || Widgets.SHOW;
        this.state = { urlParams, disabled: false };
        this.tabRef = React.createRef();
    }

    componentWillUnmount() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    renderLeftSidebar() {
        return (
            <Col md={2} className="my-3">
                <ScrollableSection>
                    <TabSection
                        value={this.state.urlParams.tab}
                        onChange={(tab) => Coordinator.invoke('url-update', { tab })}
                        ref={this.tabRef}
                    />
                    {this.state.urlParams.widgets === Widgets.SHOW
                        ? (
                            <ReminderSidebar
                                logMode={this.state.urlParams.mode}
                                disabled={this.state.disabled}
                            />
                        )
                        : null}
                </ScrollableSection>
            </Col>
        );
    }

    renderCenterSection() {
        const { layout } = this.state.urlParams;
        const indexSection = (
            <IndexSection
                Component={TabSection.Enum[this.state.urlParams.tab].Component}
                logMode={this.state.urlParams.mode}
                dateRange={this.state.urlParams.dateRange}
                search={this.state.urlParams.search}
                disabled={this.state.disabled}
                onChange={(params) => Coordinator.invoke('url-update', params)}
            />
        );
        const detailsSection = (
            <DetailsSection
                logMode={this.state.urlParams.mode}
                item={this.state.urlParams.details}
                disabled={this.state.disabled}
                onChange={(details) => Coordinator.invoke('url-update', { details })}
            />
        );
        if (layout === Layout.SPLIT) {
            return (
                <>
                    <Col md={4} className="my-3">{indexSection}</Col>
                    <Col md={4} className="my-3">{detailsSection}</Col>
                </>
            );
        } if (layout === Layout.LEFT) {
            return (
                <Col md={8} className="my-3">{indexSection}</Col>
            );
        } if (layout === Layout.RIGHT) {
            return (
                <Col md={8} className="my-3">{detailsSection}</Col>
            );
        }
        return null;
    }

    renderRightSidebar() {
        return (
            <Col md={2} className="my-3">
                <ScrollableSection>
                    <TimeSection
                        label="Time in India"
                        timezone="Asia/Kolkata"
                    />
                    <ModeSection
                        logMode={this.state.urlParams.mode}
                        disabled={this.state.disabled}
                        onChange={(mode) => Coordinator.invoke('url-update', { mode })}
                    />
                    <EnumSelectorSection
                        label="Layout: "
                        options={Layout.Options}
                        value={this.state.urlParams.layout}
                        onChange={(layout) => Coordinator.invoke('url-update', { layout })}
                    />
                    <EnumSelectorSection
                        label="Widgets: "
                        options={Widgets.Options}
                        value={this.state.urlParams.widgets}
                        onChange={(widgets) => Coordinator.invoke('url-update', { widgets })}
                    />
                    <BackupSection />
                    <ConsistencySection />
                    {this.state.urlParams.widgets === Widgets.SHOW
                        ? this.renderRightSidebarWidgets()
                        : null}
                    <CreditsSection />
                </ScrollableSection>
            </Col>
        );
    }

    renderRightSidebarWidgets() {
        const nameSortComparator = (left, right) => left.name.localeCompare(right.name);
        return (
            <>
                {this.props.clientConfig.right_sidebar_topic_sections
                    .map((section) => (
                        <TopicSection
                            key={section.topic_id}
                            logTopicId={section.topic_id}
                        />
                    ))}
                <FavoritesSection
                    title="Favorite Events"
                    dataType="log-event"
                    ViewerComponent={LogEventList.Single}
                    viewerComponentProps={{ viewerComponentProps: { displayDate: true } }}
                    valueKey="logEvent"
                />
                <FavoritesSection
                    title="Favorite Topics"
                    dataType="log-topic"
                    sortComparator={nameSortComparator}
                    ViewerComponent={LogTopicList.Single}
                    valueKey="logTopic"
                />
                <FavoritesSection
                    title="Favorite Structures"
                    dataType="log-structure"
                    sortComparator={nameSortComparator}
                    ViewerComponent={LogStructureList.Single}
                    valueKey="logStructure"
                />
                {this.props.clientConfig.right_sidebar_topic_reminder_sections
                    .map((section) => (
                        <TopicRemindersSection
                            key={section.structure_id}
                            logStructureId={section.structure_id}
                            thresholdDays={section.threshold_days}
                        />
                    ))}
            </>
        );
    }

    render() {
        return (
            <Container fluid>
                <Row>
                    {this.renderLeftSidebar()}
                    {this.renderCenterSection(this.state.urlParams.layout)}
                    {this.renderRightSidebar()}
                </Row>
                <ModalStack />
            </Container>
        );
    }
}

Applicaton.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    clientConfig: PropTypes.any,
};

export default Applicaton;
