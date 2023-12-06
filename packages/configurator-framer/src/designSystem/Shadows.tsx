import {createGlobalStyle} from "styled-components";

const Shadows = createGlobalStyle`
    :root {
        --shadows-popover: drop-shadow(5px 5px 10px rgba(0, 0, 0, 0.4));
        --shadows-dialog: 0.2px 0.4px 2.3px rgba(0, 0, 0, 0.02),
        0.6px 1px 5.7px rgba(0, 0, 0, 0.025),
        1.2px 2.1px 10.6px rgba(0, 0, 0, 0.03),
        2.3px 4px 17.2px rgba(0, 0, 0, 0.034),
        4.2px 7.2px 25.9px rgba(0, 0, 0, 0.04),
        7.6px 12.8px 37.7px rgba(0, 0, 0, 0.048),
        13.9px 23.6px 54.7px rgba(0, 0, 0, 0.061),
        40px 68px 96px rgba(0, 0, 0, 0.1);
    }
`

export default Shadows;