import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import { Enum } from '../../common/data_types';
import {
    Coordinator, DataLoader, EnumSelectorSection, ModalStack, ScrollableSection,
} from '../Common';
import { LogEventList } from '../LogEvent';
import { LogStructureList } from '../LogStructure';
import { LogTopicList } from '../LogTopic';
import PropTypes from '../prop-types';
import { ReminderSidebar } from '../Reminders';
import { SettingsContext, SettingsSection } from '../Settings';
import BackupSection from './BackupSection';
import CreditsSection from './CreditsSection';
import DetailsSection from './DetailsSection';
import FavoritesSection from './FavoritesSection';
import IndexSection from './IndexSection';
import TabSection from './TabSection';
import URLState from './URLState';

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

    insertPluginsInto(list, location) {
        Object.entries(this.props.plugins).forEach(([name, api]) => {
            if (api.getDisplayLocation() !== location) {
                return;
            }
            const key = api.getSettingsKey();
            const props = {
                settings: key ? this.state.settings[key] : null,
            };
            list.push(<div key={`plugin:${name}`}>{api.getDisplayComponent(props)}</div>);
        });
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
        const results = [];
        this.insertPluginsInto(results, 'right_sidebar_main_top');
        results.push(
            <EnumSelectorSection
                key="layout"
                label="Layout: "
                options={Layout.Options}
                value={this.state.urlParams.layout}
                onChange={(layout) => Coordinator.invoke('url-update', { layout })}
            />,
            <EnumSelectorSection
                key="widgets"
                label="Widgets: "
                options={Widgets.Options}
                value={this.state.urlParams.widgets}
                onChange={(widgets) => Coordinator.invoke('url-update', { widgets })}
            />,
            <BackupSection key="backup" />,
        );
        if (settings) {
            results.push(
                <SettingsSection
                    key="settings"
                    settings={settings}
                    plugins={this.props.plugins}
                />,
            );
        }
        this.insertPluginsInto(results, 'right_sidebar_main_bottom');
        if (this.state.urlParams.widgets === Widgets.SHOW) {
            results.push(...this.renderRightSidebarWidgets());
        }
        results.push(<CreditsSection key="credit" />);
        return (
            <Col md={2} className="my-3">
                <ScrollableSection>
                    {results}
                </ScrollableSection>
            </Col>
        );
    }

    renderRightSidebarWidgets() {
        const nameSortComparator = (left, right) => left.name.localeCompare(right.name);
        const results = [];
        this.insertPluginsInto(results, 'right_sidebar_widgets_top');
        results.push(
            <div key="favorites">
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
            </div>,
        );
        this.insertPluginsInto(results, 'right_sidebar_widgets_bottom');
        return results;
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

Applicaton.propTypes = {
    plugins: PropTypes.Custom.Plugins.isRequired,
};

export default Applicaton;
