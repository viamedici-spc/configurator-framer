import {createGlobalStyle} from "styled-components";

const Typography = createGlobalStyle`
    :root {
        --font-primary: var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif);
        --font-heading: "Inter-Medium", "Inter", "Inter Placeholder", sans-serif;
    }

    /* font sizes */
    :root {
        --text-base-size: calc(var(--framer-font-size, 16px) * var(--framer-font-size-scale, 1));
        --text-scale-ratio: 1.2;

        --text-xs: calc(1em / (var(--text-scale-ratio) * var(--text-scale-ratio)));
        --text-sm: calc(1em / var(--text-scale-ratio));
        --text-md: calc(1em * var(--text-scale-ratio));
        --text-lg: calc(1em * var(--text-scale-ratio) * var(--text-scale-ratio));
        --text-xl: calc(1em * var(--text-scale-ratio) * var(--text-scale-ratio) * var(--text-scale-ratio));
        --text-xxl: calc(1em * var(--text-scale-ratio) * var(--text-scale-ratio) * var(--text-scale-ratio) * var(--text-scale-ratio));
        --text-xxxl: calc(1em * var(--text-scale-ratio) * var(--text-scale-ratio) * var(--text-scale-ratio) * var(--text-scale-ratio) * var(--text-scale-ratio));
    }
`

export default Typography;