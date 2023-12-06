import {addPropertyControls, ControlType, PropertyControls} from "framer"
import {CSSProperties, PropsWithChildren, useLayoutEffect, useMemo, useRef, useState} from "react";
import {hexToCSSFilter} from "hex-to-css-filter";
import rgbHex from "rgb-hex";
import withErrorBoundary from "../common/withErrorBoundary";

type Props = {
    color: string,
    style?: CSSProperties,
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const Colorize = withErrorBoundary((props: PropsWithChildren<Props>) => {
    const rootRef = useRef<HTMLDivElement>();
    const [renderedColor, setRenderedColor] = useState(null);
    const lastRenderedColor = useRef(renderedColor);

    const useRenderedColor = useMemo(() => props.color.startsWith("var"), [props.color]);
    const color = useRenderedColor ? renderedColor : props.color;

    const filter = useMemo(() => {
        if (!color) {
            return;
        }

        const hexColor = rgbHex(color);
        const result = hexToCSSFilter(`#${hexColor}`, {
            acceptanceLossPercentage: 1,
            maxChecks: 30
        });

        return result.filter.replace(";", "");
    }, [color]);

    useLayoutEffect(() => {
        if (useRenderedColor) {
            const renderedColor = rootRef.current && getComputedStyle(rootRef.current).color;
            if (renderedColor != lastRenderedColor.current) {
                lastRenderedColor.current = renderedColor;
                setRenderedColor(renderedColor);
            }
        }
    });

    return (
        <div ref={rootRef} style={{...props.style, color: props.color, filter}}>
            {props.children}
        </div>
    )
})

export default Colorize;

const propertyControls: PropertyControls<PropsWithChildren<Props>> = {
    children: {
        title: "Content",
        type: ControlType.ComponentInstance,
    },
    color: {
        title: "Color",
        type: ControlType.Color,
        defaultValue: "#0000ff"
    }
}

addPropertyControls(Colorize, propertyControls);