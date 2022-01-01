import React from 'react';

import { SidebarSection } from '../Common';

function CreditsSection(props) {
    return (
        <SidebarSection>
            {'Built by: '}
            <a href="http://kaustubh.io">
                Kaustubh Karkare
            </a>
            {' | '}
            <a href="https://github.com/kaustubh-karkare/glados">
                GitHub
            </a>
        </SidebarSection>
    );
}

export default CreditsSection;
