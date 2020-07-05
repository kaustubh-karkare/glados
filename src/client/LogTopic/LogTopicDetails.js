import React from 'react';
import { LeftRight, TextEditor, debounce } from '../Common';
import { INCOMPLETE_KEY } from '../../data';
import LogTopicEntries from './LogTopicEvents';

class LogTopicDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logTopic: null,
            status: 'Unchanged!',
        };

        this.saveDebounced = debounce(this.saveNotDebounced, 500);

        window.logTopic_select = this.select.bind(this);
    }

    select(logTopic) {
        if (logTopic[INCOMPLETE_KEY]) {
            window.api.send('log-topic-load', logTopic)
                .then((updatedLogTopic) => this.setState({ logTopic: updatedLogTopic }));
        } else {
            this.setState({ logTopic });
        }
    }

    updateDetails(newDetails) {
        this.setState((state) => {
            state.logTopic.details = newDetails;
            state.status = 'Pending ...';
            return state;
        }, this.saveDebounced);
    }

    saveNotDebounced() {
        this.setState({ status: 'Saving ...' });
        window.api.send('log-topic-upsert', this.state.logTopic)
            .then((logTopic) => this.setState({ status: 'Saved!', logTopic }))
            .catch((error) => window.modalStack_displayError(error));
    }

    renderDetails() {
        return (
            <div className="log-topic-details my-1">
                <TextEditor
                    unstyled
                    value={this.state.logTopic.details}
                    onChange={(newDetails) => this.updateDetails(newDetails)}
                    serverSideTypes={['log-topic']}
                />
                <div>
                    {this.state.status}
                </div>
            </div>
        );
    }

    render() {
        if (!this.state.logTopic) {
            return null;
        }
        return (
            <div>
                <LeftRight className="mx-1">
                    <div>{this.state.logTopic.name}</div>
                    <div>Default | Favorite?</div>
                </LeftRight>
                {this.renderDetails()}
                <LogTopicEntries logTopicId={this.state.logTopic.id} />
            </div>
        );
    }
}

export default LogTopicDetails;
