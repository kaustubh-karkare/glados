import React from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';

import { LeftRight } from '../Common';
import LogCategoryEditor from './LogCategoryEditor';


class LogCategoryList extends React.Component {
    static createEmptyLogCategory() {
        return {
            id: -1,
            name: '',
            logKeys: [],
        };
    }

    constructor(props) {
        super(props);
        this.state = { editCategory: null };
    }

    componentDidMount() {
        this.reload();
    }

    onSave(category) {
        this.setState({ editCategory: null });
        window.api.send('log-category-upsert', category)
            .then(() => this.reload());
    }

    onDelete(category) {
        this.setState({ editCategory: null });
        window.api.send('log-category-delete', category)
            .then(() => this.reload());
    }

    reload() {
        window.api.send('log-category-list')
            .then((categories) => this.setState({ categories }));
    }

    renderCategory(category) {
        return (
            <Card key={category.id} className="p-2 mt-2">
                <LeftRight>
                    <div>
                        <b>{category.name}</b>
                        {category.logKeys.map((logKey) => (
                            <Button
                                className="ml-2"
                                disabled
                                key={logKey.id}
                                size="sm"
                                variant="secondary"
                            >
                                {logKey.name}
                            </Button>
                        ))}
                    </div>
                    <Button
                        onClick={() => this.setState({ editCategory: category })}
                        size="sm"
                        variant="secondary"
                    >
                        Edit
                    </Button>
                </LeftRight>
            </Card>
        );
    }

    renderEditorModal() {
        return (
            <Modal
                show={!!this.state.editCategory}
                size="lg"
                onHide={() => this.setState({ editCategory: null })}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Category Editor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.state.editCategory
                        ? (
                            <LogCategoryEditor
                                category={this.state.editCategory}
                                onSave={(category) => this.onSave(category)}
                                onDelete={(category) => this.onDelete(category)}
                            />
                        )
                        : null}
                </Modal.Body>
            </Modal>
        );
    }

    render() {
        if (!this.state.categories) {
            return <div>Loading Categories ...</div>;
        }
        return (
            <div>
                <LeftRight className="mt-2">
                    <span />
                    <Button
                        onClick={() => this.setState({
                            editCategory: LogCategoryList.createEmptyLogCategory(),
                        })}
                        size="sm"
                        variant="secondary"
                    >
                        Create
                    </Button>
                </LeftRight>
                {this.state.categories.map((category) => this.renderCategory(category))}
                {this.renderEditorModal()}
            </div>
        );
    }
}

export default LogCategoryList;
