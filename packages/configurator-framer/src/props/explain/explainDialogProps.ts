import {ControlType, PropertyControls} from "framer";
import {createContext, useContext} from "react";
import {CommonExplainProps, createCommonExplainPropertyControls} from "./commonExplainProps";
import {BoxProps, createBoxPropertyControls} from "../boxProps";
import {createStaticTextPropertyControls, StaticTextProps} from "../staticTextProps";
import {createMarginPropertyControls, MarginProps} from "../marginProps";
import {createTextPropertyControls, TextProps} from "../textProps";

export type ExplainDialogProps = CommonExplainProps & {
    dialogBox: BoxProps
    explanationCard: BoxProps & MarginProps
    constraintExplanation: {
        configurationModelId: TextProps,
        ruleId: TextProps
    }
    decisionExplanationSolutionsTitle: StaticTextProps
    constraintExplanationSolutionsTitle: StaticTextProps
    scrollShadowBorder: string
}

export const explainDialogPropertyControls = {
    dialogBox: {
        title: "Dialog Box",
        type: ControlType.Object,
        controls: createBoxPropertyControls({
            fill: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(10px) saturate(200%)",
            shadow: "0.2px 0.4px 2.3px rgba(0, 0, 0, 0.02), 0.6px 1px 5.7px rgba(0, 0, 0, 0.025), 1.2px 2.1px 10.6px rgba(0, 0, 0, 0.03), 2.3px 4px 17.2px rgba(0, 0, 0, 0.034), 4.2px 7.2px 25.9px rgba(0, 0, 0, 0.04), 7.6px 12.8px 37.7px rgba(0, 0, 0, 0.048), 13.9px 23.6px 54.7px rgba(0, 0, 0, 0.061), 40px 68px 96px rgba(0, 0, 0, 0.1)",
            radius: 12,
            paddingTop: 18,
            paddingBottom: 0,
            paddingLeft: 20,
            paddingRight: 24,
            isMixedPadding: true
        })
    },
    explanationCard: {
        title: "Explanation Card",
        type: ControlType.Object,
        controls: {
            ...createBoxPropertyControls({
                fill: "white",
                shadow: "2px 1px 10px -5px rgba(0, 0, 0, 0.4)",
                radius: 7,
                padding: 12,
                isMixedPadding: false
            }),
            ...createMarginPropertyControls({
                marginLeft: -12,
                marginRight: -12,
                isMixedMargin: true
            })
        }
    },
    constraintExplanation: {
        title: "Constraint Explanation",
        type: ControlType.Object,
        controls: {
            configurationModelId: {
                title: "Configuration Model Id",
                type: ControlType.Object,
                controls: createTextPropertyControls({
                    color: "#171717",
                    text: {
                        fontWeight: "400",
                        fontSize: 16,
                        fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
                    }
                })
            },
            ruleId: {
                title: "Rule Id",
                type: ControlType.Object,
                controls: createTextPropertyControls({
                    color: "#171717",
                    text: {
                        fontWeight: "500",
                        fontSize: 14,
                        fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
                    }
                })
            }
        }
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
                color: "#171717",
                text: {
                    fontWeight: "500",
                    fontSize: 19,
                    fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
                }
            }
        },
        attributeName: {
            color: "#171717",
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
                fill: "#efefef",
                iconFill: "#cfefc7",
                iconColor: "#48c52b"
            },
            remove: {
                color: "white",
                text: {
                    fontWeight: "500",
                    fontSize: 14,
                    fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
                },
                radius: 300,
                fill: "#efefef",
                iconFill: "#ffdada",
                iconColor: "#c52b2b"
            },
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 10,
            isMixedPadding: true
        },
        applySolutionButton: {
            fill: "#F2F2F2",
            radius: 7,
            paddingTop: 9,
            paddingBottom: 9,
            paddingLeft: 29,
            paddingRight: 29,
            isMixedPadding: true,
            color: "#171717",
            staticText: "Apply Solution",
            text: {
                textAlign: "center",
                fontWeight: "600",
                fontSize: 14,
                fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
            },
            focusOutline: {
                color: "#00a1e6",
                size: 2,
                offset: -1
            },
            marginTop: 18,
            isMixedMargin: true
        },
        closeButton: {
            fill: "transparent",
            radius: 5,
            paddingTop: 1,
            paddingBottom: 1,
            paddingLeft: 6,
            paddingRight: 6,
            isMixedPadding: true,
            color: "#171717",
            staticText: "Close",
            text: {
                textAlign: "center",
                fontWeight: "400",
                fontSize: 14,
                fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
            },
            focusOutline: {
                color: "#00a1e6",
                size: 2,
                offset: -1
            }
        },
        infoMessage: {
            color: "#171717",
            text: {
                fontWeight: "400",
                fontSize: 16,
                fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
            }
        },
    }),
    decisionExplanationSolutionsTitle: {
        title: "Decision Explanation Solutions Title",
        type: ControlType.Object,
        controls: {
            ...createStaticTextPropertyControls({
                color: "#171717",
                staticText: "Solutions",
                text: {
                    fontWeight: "500",
                    fontSize: 16,
                    fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
                }
            })
        }
    },
    constraintExplanationSolutionsTitle: {
        title: "Constraint Explanation Solutions Title",
        type: ControlType.Object,
        controls: {
            ...createStaticTextPropertyControls({
                color: "#171717",
                staticText: "Constraint Explanations",
                text: {
                    fontWeight: "500",
                    fontSize: 16,
                    fontFamily: 'var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif)'
                }
            })
        }
    },
    scrollShadowBorder: {
        title: "Scroll Shadow Border",
        type: ControlType.Color,
        defaultValue: "rgba(0, 0, 0, 0.3)"
    },
} satisfies PropertyControls<ExplainDialogProps>;

export const explainDialogPropsContext = createContext<ExplainDialogProps>(null);
export const useExplainDialogProps = (): ExplainDialogProps => useContext(explainDialogPropsContext);