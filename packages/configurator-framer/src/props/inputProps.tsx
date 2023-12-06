import {CSSProperties} from "react";
import {ControlDescription, ControlType, PropertyControls} from "framer";
import {attributeIdPropertyControls, AttributeIdProps} from "./attributeIdProps";
import {boxPropertyControls, BoxProps, getBoxStyle} from "./boxProps";
import {getTextStyle, textPropertyControls, TextProps} from "./textProps";
import {match, P} from "ts-pattern";
import {explainPropertyControls, ExplainProps} from "./explainProps";

export type InputProps = AttributeIdProps & BoxProps & TextProps & ExplainProps & {
    style: CSSProperties,
    implicitLabelPrefix: string,
    unsatisfiedColors: InputStateColors,
    implicitSelectedColors: InputStateColors
}

export type InputStateColors = {
    fill: string,
    color: string,
    borderColor: string
}

export const inputStateColorProperty: ControlDescription<BoxProps> = {
    type: ControlType.Object,
    optional: true,
    controls: {
        fill: {
            title: "Fill",
            type: ControlType.Color,
            optional: true
        },
        color: {
            title: "Color",
            type: ControlType.Color,
            optional: true
        },
        borderColor: {
            title: "Border Color",
            type: ControlType.Color,
            optional: true
        }
    }
};

export const inputPropertyControls = {
    ...attributeIdPropertyControls,
    ...textPropertyControls,
    ...boxPropertyControls,
    implicitLabelPrefix: {
        title: "Implicit Label Prefix",
        type: ControlType.String,
        defaultValue: "Implicit: "
    },
    unsatisfiedColors: {
        ...inputStateColorProperty,
        title: "Unsatisfied Colors"
    },
    implicitSelectedColors: {
        ...inputStateColorProperty,
        title: "Implicit Selected Colors"
    },
    ...explainPropertyControls
} satisfies PropertyControls<InputProps>

export const getInputStyle = (props: InputProps, isSatisfied: boolean, isImplicitSelected: boolean): CSSProperties => {
    const boxStyle = getBoxStyle(props);
    const textStyle = getTextStyle(props);

    return ({
        ...boxStyle,
        ...textStyle,
        backgroundColor: match({
            isSatisfied,
            isImplicitSelected,
            unsatisfiedFill: props.unsatisfiedColors?.fill,
            implicitSelectedFill: props.implicitSelectedColors?.fill
        })
            .with({isSatisfied: false, unsatisfiedFill: P.string.minLength(1)}, p => p.unsatisfiedFill)
            .with({isImplicitSelected: true, implicitSelectedFill: P.string.minLength(1)}, p => p.implicitSelectedFill)
            .otherwise(() => boxStyle.backgroundColor),
        borderColor: match({
            isSatisfied,
            isImplicitSelected,
            unsatisfiedBorderColor: props.unsatisfiedColors?.borderColor,
            implicitSelectedBorderColor: props.implicitSelectedColors?.borderColor
        })
            .with({isSatisfied: false, unsatisfiedBorderColor: P.string.minLength(1)}, p => p.unsatisfiedBorderColor)
            .with({
                isImplicitSelected: true,
                implicitSelectedBorderColor: P.string.minLength(1)
            }, p => p.implicitSelectedBorderColor)
            .otherwise(() => boxStyle.borderColor),
        color: match({
            isSatisfied,
            isImplicitSelected,
            unsatisfiedColor: props.unsatisfiedColors?.color,
            implicitSelectedColor: props.implicitSelectedColors?.color
        })
            .with({isSatisfied: false, unsatisfiedColor: P.string.minLength(1)}, p => p.unsatisfiedColor)
            .with({
                isImplicitSelected: true,
                implicitSelectedColor: P.string.minLength(1)
            }, p => p.implicitSelectedColor)
            .otherwise(() => textStyle.color),
        ...props.style
    });
}