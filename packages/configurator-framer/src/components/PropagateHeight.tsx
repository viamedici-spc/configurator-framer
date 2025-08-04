import React, {PropsWithChildren, useEffect, useRef, useState} from "react"
import {addPropertyControls, ControlType} from "framer"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";

export default function PropagateHeight(props: PropsWithChildren) {
    const renderPlaceholder = useRenderPlaceholder()

    if (renderPlaceholder) {
        return <div style={{width: "100%"}}>{props.children}</div>
    }

    const lastHeightRef = useRef<number>(0)
    const [container, setContainer] = useState<HTMLDivElement | null>(null)

    const propagateHeight = (height: number) => {
        window.parent.postMessage(
            {type: "spc.configurator.height", height},
            "*"
        )
    }

    function updateHeight(el: HTMLDivElement | null = container): void {
        if (!el) {
            return;
        }

        const containerHeight = el.offsetHeight
        if (containerHeight !== lastHeightRef.current) {
            lastHeightRef.current = containerHeight
            propagateHeight(containerHeight)
        }
    }

    useEffect(() => {
        const el = container;
        if (!el) return;

        updateHeight(el);

        const resizeObserver = new ResizeObserver(() => {
            updateHeight(el);
        });

        resizeObserver.observe(el);

        return () => {
            resizeObserver.disconnect();
        };
    }, [container]);

    return (
        <div ref={setContainer} style={{width: "100%"}}>
            {props.children}
        </div>
    )
}

addPropertyControls(PropagateHeight, {
    children: {
        title: "Content",
        type: ControlType.ComponentInstance,
    },
})