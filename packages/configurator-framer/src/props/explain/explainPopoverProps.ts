import {ControlType, PropertyControls} from "framer";
import {createContext, CSSProperties, ReactNode, useContext} from "react";
import {createCommonExplainPropertyControls, CommonExplainProps} from "./commonExplainProps";
import {BoxProps, createBoxPropertyControls} from "../boxProps";
import {ButtonProps, createButtonPropertyControls} from "../buttonProps";
import {createMarginPropertyControls, MarginProps} from "../marginProps";
import {createStaticTextPropertyControls, StaticTextProps} from "../staticTextProps";

export type ExplainPopoverProps = CommonExplainProps & {
    popoverBox: BoxProps;
    listSeparator: string;
    arrow: string;
    subline: StaticTextProps;
    showConstraintsButton: ButtonProps & MarginProps;
    showMoreButton: ButtonProps & MarginProps;
    customPopover?: ReactNode // Expects an ExplainContent component (custom)
}

export const explainPopoverPropertyControls = {
    popoverBox: {
        title: "Popover Box",
        type: ControlType.Object,
        controls: createBoxPropertyControls({
            fill: "#002134",
            radius: 12,
            padding: 18,
            isMixedPadding: false,
            filter: "drop-shadow(5px 5px 10px rgba(0, 0, 0, 0.4))"
        }),
        hidden: (props) => props.useCustomExplain,
    },
    subline: {
        title: "Subline",
        type: ControlType.Object,
        controls: {
            ...createStaticTextPropertyControls({
                color: "white",
                staticText: "Solution",
                text: {
                    fontWeight: "500",
                    fontSize: 16,
                    fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
                }
            })
        },
        hidden: (props) => props.useCustomExplain,
    },
    ...createCommonExplainPropertyControls({
        header: {
            subject: {
                color: "rgb(0, 161, 230)",
                text: {
                    fontWeight: "500",
                    fontSize: 19,
                    fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
                }
            },
            suffix: {
                color: "white",
                text: {
                    fontWeight: "500",
                    fontSize: 19,
                    fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
                }
            }
        },
        attributeName: {
            color: "white",
            text: {
                fontWeight: "400",
                fontSize: 16,
                fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
            }
        },
        attributeValue: {
            add: {
                color: "white",
                text: {
                    fontWeight: "500",
                    fontSize: 14,
                    fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
                },
                radius: 300,
                fill: "rgba(255, 255, 255, 0.2)",
                iconFill: "rgba(47, 255, 0, 0.2)",
                iconColor: "#63e446"
            },
            remove: {
                color: "white",
                text: {
                    fontWeight: "500",
                    fontSize: 14,
                    fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
                },
                radius: 300,
                fill: "rgba(255, 255, 255, 0.2)",
                iconFill: "#ff00004a",
                iconColor: "#ff6060"
            },
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 10,
            isMixedPadding: true
        },
        applySolutionButton: {
            fill: "rgb(0, 161, 230)",
            fillHover: "#15ACED",
            radius: 300,
            paddingTop: 9,
            paddingBottom: 9,
            paddingLeft: 29,
            paddingRight: 29,
            isMixedPadding: true,
            color: "white",
            staticText: "Apply Solution",
            text: {
                textAlign: "center",
                fontWeight: "600",
                fontSize: 14,
                fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
            },
            focusOutline: {
                color: "rgba(255, 255, 255, 0.8)",
                size: 2,
                offset: -1
            },
            marginTop: 18,
            isMixedMargin: true
        },
        closeButton: {
            fill: "transparent",
            fillHover: "#FFFFFF26",
            radius: 300,
            paddingTop: 2,
            paddingBottom: 2,
            paddingLeft: 6,
            paddingRight: 6,
            isMixedPadding: true,
            color: "white",
            staticText: "Close",
            text: {
                textAlign: "center",
                fontWeight: "400",
                fontSize: 14,
                fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
            },
            focusOutline: {
                color: "rgba(255, 255, 255, 0.8)",
                size: 2,
                offset: -1
            }
        },
        infoMessage: {
            color: "white",
            text: {
                fontWeight: "400",
                fontSize: 16,
                fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
            }
        },
    }),
    showConstraintsButton: {
        title: "Show Constraints Button",
        type: ControlType.Object,
        controls: {
            ...createButtonPropertyControls({
                fill: "transparent",
                fillHover: "transparent",
                radius: 5,
                paddingTop: 1,
                paddingBottom: 1,
                paddingLeft: 6,
                paddingRight: 6,
                isMixedPadding: true,
                color: "white",
                staticText: "Show Constraints",
                text: {
                    textAlign: "center",
                    fontWeight: "500",
                    fontSize: 14,
                    fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
                },
                focusOutline: {
                    color: "rgba(255, 255, 255, 0.8)",
                    size: 2,
                    offset: -1
                }
            }),
            ...createMarginPropertyControls({
                marginTop: 13
            })
        },
        hidden: (props) => props.useCustomExplain,
    },
    showMoreButton: {
        title: "Show More Button",
        type: ControlType.Object,
        controls: {
            ...createButtonPropertyControls({
                fill: "transparent",
                fillHover: "transparent",
                radius: 5,
                paddingTop: 1,
                paddingBottom: 1,
                paddingLeft: 6,
                paddingRight: 6,
                isMixedPadding: true,
                color: "white",
                staticText: "Show more ({{amount}})",
                text: {
                    textAlign: "center",
                    fontWeight: "500",
                    fontSize: 14,
                    fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
                },
                focusOutline: {
                    color: "rgba(255, 255, 255, 0.8)",
                    size: 2,
                    offset: -1
                }
            }),
            ...createMarginPropertyControls({
                marginTop: 13
            })
        },
        hidden: (props) => props.useCustomExplain,
    },
    listSeparator: {
        title: "List Separator",
        type: ControlType.Color,
        defaultValue: "rgba(255, 255, 255, 0.3)",
        hidden: (props) => props.useCustomExplain,
    },
    arrow: {
        title: "Arrow",
        type: ControlType.Color,
        defaultValue: "#002134",
    },
    useCustomExplain: {
        title: "Use Custom Popover",
        type: ControlType.Boolean,
        defaultValue: false
    },
} satisfies PropertyControls<ExplainPopoverProps>;

export const getArrowStyle = (props: ExplainPopoverProps): CSSProperties => ({
    fill: props.arrow ?? props.popoverBox?.fill
});

export const explainPopoverPropsContext = createContext<ExplainPopoverProps>(null);
export const useExplainPopoverProps = (): ExplainPopoverProps => useContext(explainPopoverPropsContext);