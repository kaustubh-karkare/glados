import React from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

const SortableDragHandle = SortableHandle(({ children }) => <>{children}</>);
const SortableList = SortableContainer(({ children }) => <div>{children}</div>);

export { SortableDragHandle, SortableElement, SortableList };
