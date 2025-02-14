import {ReactNode} from "react";
import styled from "styled-components";

const Root = styled.div`
    padding: var(--space-md);
    margin: var(--space-md);
    border-radius: var(--shape-border-radius-sm);
    background: white;

    &.warning {
        border: 1px solid orange;
        border-left-width: 15px;
    }

    &.error {
        border: 1px solid #DB0100;
        border-left-width: 15px;
    }
`

const Title = styled.h3`
    margin: 0 0 var(--space-xs);
`

const Message = styled.div`
    white-space: break-spaces;
`

export function InitializationErrorMessage(props: { title: ReactNode, message: ReactNode, type: "warning" | "error" }) {
    return (
        <Root className={props.type}>
            <Title>
                {props.title}
            </Title>
            <Message>
                {props.message}
            </Message>
        </Root>
    )
}