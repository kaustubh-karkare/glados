import React from 'react';

const DateContext = React.createContext(null);

DateContext.Wrapper = (Component) => (moreProps) => (
    <DateContext.Consumer>
        {(dateContext) => <Component {...dateContext} {...moreProps} />}
    </DateContext.Consumer>
);

export default DateContext;
