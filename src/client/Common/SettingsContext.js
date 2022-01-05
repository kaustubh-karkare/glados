import React from 'react';

const SettingsContext = React.createContext({});

SettingsContext.Wrapper = (Component) => (moreProps) => (
    <SettingsContext.Consumer>
        {(settings) => <Component settings={settings} {...moreProps} />}
    </SettingsContext.Consumer>
);

export default SettingsContext;
