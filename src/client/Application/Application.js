import classNames from 'classnames';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import React from 'react';
import Row from 'react-bootstrap/Row';
import { LogStructureGroupList } from '../LogStructure';
import { LogTopicSidebar, LogTopicList } from '../LogTopic';
import { Coordinator, ModalStack, ScrollableSection } from '../Common';
import { ReminderSidebar } from '../Reminders';
import BackupSection from './BackupSection';
import LayoutSection from './LayoutSection';
import LogEventSearch from './LogEventSearch';
import DetailsSection from './DetailsSection';
import ConsistencySection from './ConsistencySection';
import Enum from '../../common/Enum';


const [TabOptions, TabType, TabOptionsMap] = Enum([
    {
        label: 'Manage Events',
        value: 'log_events',
        Component: LogEventSearch,
    },
    {
        label: 'Manage Topics',
        value: 'log_topics',
        Component: LogTopicList,
        componentProps: { selector: { parent_topic_id: null, has_structure: false } },
    },
    {
        label: 'Manage Structures',
        value: 'log_structures',
        Component: LogStructureGroupList,
    },
]);

const [LayoutOptions, LayoutType] = Enum([
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
            activeTab: TabType.LOG_EVENTS,
            activeLayout: LayoutType.DEFAULT,
            activeItem: null,
        };
        Coordinator.register('details', this.onDetailsChange.bind(this));
        Coordinator.register('layout-list', () => [LayoutOptions, this.state.activeLayout]);
        Coordinator.register('layout', (activeLayout) => this.setState({ activeLayout }));
    }

    onTabChange(tabType) {
        this.setState({ activeTab: tabType, activeLayout: LayoutType.DEFAULT });
    }

    onDetailsChange(item) {
        this.setState({ activeItem: item });
    }

    renderLeftSidebar() {
        return (
            <Col md={2} className="my-3">
                <ScrollableSection>
                    {TabOptions.map((option) => (
                        <div
                            key={option.value}
                            className={classNames({
                                'tab-item': true,
                                'tab-item-selected': this.state.activeTab === option.value,
                            })}
                            onClick={() => this.onTabChange(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                    <ReminderSidebar />
                </ScrollableSection>
            </Col>
        );
    }

    renderLayout() {
        const { Component, componentProps } = TabOptionsMap[this.state.activeTab];
        if (this.state.activeLayout === LayoutType.DEFAULT) {
            return (
                <>
                    <Col md={4} className="my-3">
                        <ScrollableSection>
                            <Component {...componentProps} />
                        </ScrollableSection>
                    </Col>
                    <Col md={4} className="my-3">
                        <ScrollableSection>
                            <DetailsSection item={this.state.activeItem} />
                        </ScrollableSection>
                    </Col>
                </>
            );
        } if (this.state.activeLayout === LayoutType.FOCUS) {
            return (
                <Col md={8} className="my-3">
                    <ScrollableSection>
                        <DetailsSection item={this.state.activeItem} />
                    </ScrollableSection>
                </Col>
            );
        }
        return <div>{`Unknown layout: ${this.state.activeLayout}`}</div>;
    }

    // eslint-disable-next-line class-methods-use-this
    renderRightSidebar() {
        return (
            <Col md={2} className="my-3">
                <LayoutSection />
                <BackupSection />
                <ConsistencySection />
                <LogTopicSidebar />
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
