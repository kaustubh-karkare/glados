import React from 'react';

import { SidebarSection } from '../Common';

function CreditsSection(props) {
    return (
        <SidebarSection>
            {'Built by: '}
            <a href="https://www.facebook.com/kaustubh.karkare/">Kaustubh</a>
            {' '}
            <a href="https://www.linkedin.com/in/kaustubh-karkare/">Karkare</a>
            {' | '}
            <a href="https://github.com/kaustubh-karkare/glados">
                GitHub
            </a>
        </SidebarSection>
    );
}

export default CreditsSection;
