import React from 'react';
import LogTagEditor from './LogTagEditor';
import { createEmptyLogTag } from '../Data';

class LogTagListEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logTags: null,
            logTag: createEmptyLogTag(),
        };
    }

    componentDidMount() {
        this.reload();
    }

    reload() {
        window.api.send('log-tag-list')
            .then((logTags) => this.setState({ logTags }));
    }

    saveLogTag(logTag) {
        window.api.send('log-tag-upsert', logTag)
            .then(() => {
                this.setState({ logTag: createEmptyLogTag() });
                this.reload();
            });
    }

    deleteLogTag(logTag) {
        window.api.send('log-tag-delete', logTag)
            .then(() => this.reload());
    }

    render() {
        if (!this.state.logTags) {
            return <div>Loading Tags ...</div>;
        }
        return (
            <div className="my-2">
                {this.state.logTags.map((logTag, index) => (
                    <LogTagEditor
                        key={logTag.id}
                        logTag={logTag}
                        onUpdate={(updatedLogTag) => {
                            this.setState((state) => {
                                const logTags = [...state.logTags];
                                logTags[index] = updatedLogTag;
                                return { logTags };
                            });
                        }}
                        onSave={() => this.saveLogTag(logTag)}
                        onDelete={() => this.deleteLogTag(logTag)}
                    />
                ))}
                <LogTagEditor
                    logTag={this.state.logTag}
                    onUpdate={(logTag) => this.setState({ logTag })}
                    onSave={() => this.saveLogTag(this.state.logTag)}
                />
            </div>
        );
    }
}

export default LogTagListEditor;
