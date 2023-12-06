import {RenderTarget} from "framer";

export default function useRenderPlaceholder() {
    return RenderTarget.current() !== RenderTarget.preview;
}