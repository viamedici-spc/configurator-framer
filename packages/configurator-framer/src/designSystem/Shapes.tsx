import {createGlobalStyle} from "styled-components";

const Shapes = createGlobalStyle`
    :root {
        --shape-border-radius-xs: 5px;
        --shape-border-radius-sm: 7px;
        --shape-border-radius-md: 12px;
        --shape-border-radius-lg: 20px;
    }
`

export default Shapes;