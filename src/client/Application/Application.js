import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import React from 'react';
import Row from 'react-bootstrap/Row';
import {
    Coordinator, DataLoader, EnumSelectorSection, ModalStack, ScrollableSection,
} from '../Common';
import { LogEventList } from '../LogEvent';
import { LogStructureList } from '../LogStructure';
import { LogTopicList } from '../LogTopic';
import { ReminderSidebar, TopicRemindersSection } from '../Reminders';
import BackupSection from './BackupSection';
import CreditsSection from './CreditsSection';
import DetailsSection from './DetailsSection';
import IndexSection from './IndexSection';
import FavoritesSection from './FavoritesSection';
import { SettingsContext, SettingsSection } from '../Settings';
import TimeSection from './TimeSection';
import TopicSection from './TopicSection';
import TabSection from './TabSection';
import URLState from './URLState';
import { Enum } from '../../common/data_types';

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
        this.state = { urlParams: null, settings: null, disabled: false };
        this.tabRef = React.createRef();
    }

    componentDidMount() {
        this.deregisterCallbacks = [
            URLState.init(),
            Coordinator.subscribe('url-change', (urlParams) => this.setState({ urlParams })),
        ];
        const urlParams = Coordinator.invoke('url-params');
        urlParams.tab = urlParams.tab || TabSection.Enum.LOG_EVENT;
        urlParams.layout = urlParams.layout || Layout.SPLIT;
        urlParams.widgets = urlParams.widgets || Widgets.SHOW;
        this.setState({ urlParams });

        this.dataLoader = new DataLoader({
            getInput: () => ({ name: 'settings-get' }),
            onData: (settings) => this.setState({ settings }),
        });
    }

    componentDidUpdate() {
        this.dataLoader.reload();
    }

    componentWillUnmount() {
        this.dataLoader.stop();
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
                            <ReminderSidebar disabled={this.state.disabled} />
                        )
                        : null}
                </ScrollableSection>
            </Col>
        );
    }

    renderCenterSection() {
        const { settings } = this.state;
        const { layout } = this.state.urlParams;
        const indexSection = (
            <IndexSection
                Component={TabSection.Enum[this.state.urlParams.tab].Component}
                dateRange={this.state.urlParams.dateRange}
                search={this.state.urlParams.search}
                disabled={this.state.disabled}
                onChange={(params) => Coordinator.invoke('url-update', params)}
            />
        );
        let detailsSection = (
            <DetailsSection
                item={this.state.urlParams.details}
                disabled={this.state.disabled}
                onChange={(details) => Coordinator.invoke('url-update', { details })}
            />
        );
        if (settings.display_two_details_sections) {
            detailsSection = (
                <ScrollableSection>
                    <DetailsSection
                        item={this.state.urlParams.details}
                        disabled={this.state.disabled}
                        onChange={(details) => Coordinator.invoke('url-update', { details })}
                    />
                    <div className="py-4" />
                    <DetailsSection
                        item={this.state.urlParams.details2}
                        disabled={this.state.disabled}
                        onChange={(details2) => Coordinator.invoke('url-update', { details2 })}
                    />
                </ScrollableSection>
            );
        }
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
        const { settings } = this.state;
        return (
            <Col md={2} className="my-3">
                <ScrollableSection>
                    {
                        (settings.timezones || []).map((item, index) => (
                            <TimeSection
                                key={item.__id__}
                                label={item.label}
                                timezone={item.timezone}
                            />
                        ))
                    }
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
                    {settings
                        ? <SettingsSection settings={settings} />
                        : null}
                    {this.state.urlParams.widgets === Widgets.SHOW
                        ? this.renderRightSidebarWidgets()
                        : null}
                    <CreditsSection />
                </ScrollableSection>
            </Col>
        );
    }

    renderRightSidebarWidgets() {
        const { settings } = this.state;
        const nameSortComparator = (left, right) => left.name.localeCompare(right.name);
        return (
            <>
                {(settings.topic_sections || [])
                    .map((item) => (
                        <TopicSection
                            key={item.__id__}
                            logTopicId={item.logTopic.__id__}
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
                {(settings.reminder_sections || [])
                    .map((item) => (
                        <TopicRemindersSection
                            key={item.__id__}
                            logStructureId={item.logStructure.__id__}
                            thresholdDays={parseInt(item.thresholdDays, 10)}
                        />
                    ))}
            </>
        );
    }

    render() {
        if (!this.state.urlParams) {
            return null;
        } if (!this.state.settings) {
            return null;
        }
        return (
            <SettingsContext.Provider value={this.state.settings}>
                <Container fluid>
                    <Row>
                        {this.renderLeftSidebar()}
                        {this.renderCenterSection(this.state.urlParams.layout)}
                        {this.renderRightSidebar()}
                    </Row>
                    <ModalStack />
                </Container>
            </SettingsContext.Provider>
        );
    }
}

export default Applicaton;
