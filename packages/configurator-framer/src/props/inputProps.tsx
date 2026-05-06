import {CSSProperties} from "react";
import {ControlDescription, ControlType, PropertyControls} from "framer";
import {attributeIdPropertyControls, AttributeIdProps} from "./attributeIdProps";
import {createBoxPropertyControls, BoxProps, getBoxStyle} from "./boxProps";
import {getTextStyle, createTextPropertyControls, TextProps} from "./textProps";
import {match, P} from "ts-pattern";
import {explainPropertyControls, ExplainProps} from "./explainProps";

export type InputProps = AttributeIdProps & BoxProps & TextProps & ExplainProps & {
    style: CSSProperties,
    implicitLabelPrefix: string,
    fixedLabelPrefix: string,
    unsatisfiedColors: InputStateColors,
    implicitSelectedColors: InputStateColors,
    fixedColors: InputStateColors
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
    ...createTextPropertyControls({
        color: "black",
        text: {
            fontSize: 16,
            textAlign: "left"
        }
    }),
    ...createBoxPropertyControls({
        fill: "#EBEBEB",
        radius: 6
    }),
    implicitLabelPrefix: {
        title: "Implicit Label Prefix",
        type: ControlType.String,
        defaultValue: "Implicit: "
    },
    fixedLabelPrefix: {
        title: "Fixed Label Prefix",
        type: ControlType.String,
        defaultValue: "Fixed: "
    },
    unsatisfiedColors: {
        ...inputStateColorProperty,
        title: "Unsatisfied Colors"
    },
    implicitSelectedColors: {
        ...inputStateColorProperty,
        title: "Implicit Selected Colors"
    },
    fixedColors: {
        ...inputStateColorProperty,
        title: "Fixed Colors"
    },
    ...explainPropertyControls
} satisfies PropertyControls<InputProps>

export const getInputStyle = (props: InputProps, isSatisfied: boolean, isImplicitSelected: boolean, isFixedSelected: boolean = false): CSSProperties => {
    const boxStyle = getBoxStyle(props);
    const textStyle = getTextStyle(props);

    return ({
        ...boxStyle,
        ...textStyle,
        backgroundColor: match({
            isSatisfied,
            isImplicitSelected,
            isFixedSelected,
            unsatisfiedFill: props.unsatisfiedColors?.fill,
            implicitSelectedFill: props.implicitSelectedColors?.fill,
            fixedFill: props.fixedColors?.fill
        })
            .with({isSatisfied: false, unsatisfiedFill: P.string.minLength(1)}, p => p.unsatisfiedFill)
            .with({isImplicitSelected: true, implicitSelectedFill: P.string.minLength(1)}, p => p.implicitSelectedFill)
            .with({isFixedSelected: true, fixedFill: P.string.minLength(1)}, p => p.fixedFill)
            .otherwise(() => boxStyle.backgroundColor),
        borderColor: match({
            isSatisfied,
            isImplicitSelected,
            isFixedSelected,
            unsatisfiedBorderColor: props.unsatisfiedColors?.borderColor,
            implicitSelectedBorderColor: props.implicitSelectedColors?.borderColor,
            fixedBorderColor: props.fixedColors?.borderColor
        })
            .with({isSatisfied: false, unsatisfiedBorderColor: P.string.minLength(1)}, p => p.unsatisfiedBorderColor)
            .with({
                isImplicitSelected: true,
                implicitSelectedBorderColor: P.string.minLength(1)
            }, p => p.implicitSelectedBorderColor)
            .with({isFixedSelected: true, fixedBorderColor: P.string.minLength(1)}, p => p.fixedBorderColor)
            .otherwise(() => boxStyle.borderColor),
        color: match({
            isSatisfied,
            isImplicitSelected,
            isFixedSelected,
            unsatisfiedColor: props.unsatisfiedColors?.color,
            implicitSelectedColor: props.implicitSelectedColors?.color,
            fixedColor: props.fixedColors?.color
        })
            .with({isSatisfied: false, unsatisfiedColor: P.string.minLength(1)}, p => p.unsatisfiedColor)
            .with({
                isImplicitSelected: true,
                implicitSelectedColor: P.string.minLength(1)
            }, p => p.implicitSelectedColor)
            .with({isFixedSelected: true, fixedColor: P.string.minLength(1)}, p => p.fixedColor)
            .otherwise(() => textStyle.color),
        ...props.style
    });
}