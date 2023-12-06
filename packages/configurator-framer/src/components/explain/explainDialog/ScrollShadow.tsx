import React, {useEffect, useState, useRef, HTMLProps} from 'react';
import styled from "styled-components";
import clsx from "clsx";
import mergeProps from "merge-props";

const Shadow = styled.div`
    position: sticky;
    top: 0;
    transition: all 0.1s;
    border-top: 1px solid transparent;

    &.active {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        border-color: var(--color-explain-dialog-scroll-shadow-border);
    }

    @media only screen and (min-resolution: 2dppx) {
        border-top-width: 0.5px;
    }
`

export default function ScrollShadow(props: HTMLProps<HTMLDivElement>) {
    const [showShadow, setShowShadow] = useState(false);
    const topSentinelRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setShowShadow(!entry.isIntersecting), {root: null, threshold: 1.0});

        const topSentinelElement = topSentinelRef.current;
        if (topSentinelElement) {
            observer.observe(topSentinelElement);
        }

        return () => {
            if (topSentinelElement) {
                observer.unobserve(topSentinelElement);
            }
        };
    }, []);

    return (
        <>
            <div ref={topSentinelRef}></div>
            <Shadow {...mergeProps(props, {className: clsx(showShadow && "active")})}/>
        </>
    );
}