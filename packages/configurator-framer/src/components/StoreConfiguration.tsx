import {addPropertyControls, ControlType, PropertyControls} from "framer"
import {PropsWithChildren} from "react";
import cloneChildrenWithProps from "../common/cloneChildrenWithProps";
import {useConfigurationStoring} from "@viamedici-spc/configurator-react";
import {StoredConfigurationEnvelop} from "../common/StoredConfiguration";
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";

type Props = {
    target: "file" | "clipboard"
    fileName: string,
    fileExtension: string
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function StoreConfiguration(props: PropsWithChildren<Props>) {
    const {children, fileExtension, fileName, target} = props
    const renderPlaceholder = useRenderPlaceholder();

    if (renderPlaceholder) {
        return children
    }

    const {storeConfiguration} = useConfigurationStoring();

    const onClick = async () => {
        const storedConfiguration = await storeConfiguration();
        const envelop = {type: "spc-stored-configuration", storedConfiguration: storedConfiguration} satisfies StoredConfigurationEnvelop
        if (target === "file") {
            downloadJsonFile(envelop, `${fileName}.${fileExtension}`)
        } else if (target === "clipboard") {
            copyJsonToClipboard(envelop)
        }
    }

    return cloneChildrenWithProps(children, {onClick})
}

const propertyControls: PropertyControls<PropsWithChildren<Props>> = {
    children: {
        title: "Content",
        type: ControlType.ComponentInstance,
    },
    target: {
        title: "Target",
        type: ControlType.Enum,
        defaultValue: "file",
        options: ["file", "clipboard"],
        optionTitles: ["File", "Clipboard"],
        displaySegmentedControl: true,
        segmentedControlDirection: "vertical"
    },
    fileName: {
        title: "File Name",
        type: ControlType.String,
        defaultValue: "configuration",
        hidden: p => p.target !== "file"
    },
    fileExtension: {
        title: "File Extension",
        type: ControlType.String,
        defaultValue: "json",
        hidden: p => p.target !== "file"
    }
}

addPropertyControls(StoreConfiguration, propertyControls);

function downloadJsonFile(data: Object, filename: string) {
    const json = JSON.stringify(data)
    const blob = new Blob([json], {type: "application/json"})
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = filename

    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}

function copyJsonToClipboard(data: Object) {
    const json = JSON.stringify(data)
    navigator.clipboard.writeText(json)
        .catch((error) => {
            alert("Failed to copy the configuration to clipboard: " + error)
        })
}