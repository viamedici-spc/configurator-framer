import {useEffect, useRef} from "react";
import styled from "styled-components";
import {addPropertyControls, ControlType, PropertyControls} from "framer";

const Root = styled.div`
    width: 10px;
    height: 10px;
    background-color: greenyellow;
`

type Props = {
    delay: number
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function ScrollIntoView(props: Props) {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!rootRef.current) {
            return;
        }

        const timeout = setTimeout(() => {
            rootRef.current.scrollIntoView();
        }, props.delay)

        return () => clearTimeout(timeout);
    }, [rootRef.current]);

    return <Root ref={rootRef}></Root>
}

const propertyControls: PropertyControls<Props> = {
    delay: {
        title: "Delay",
        type: ControlType.Number,
        min: 0,
        unit: "ms",
        defaultValue: 0,
        step: 1
    }
}

addPropertyControls(ScrollIntoView, propertyControls);