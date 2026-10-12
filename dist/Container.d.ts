import * as React from "react";
import * as Dockable from "./index.js";
export type DockModifier = "Shift" | "Ctrl" | "Alt" | "None";
export declare function Container(props: {
    state: Dockable.RefState<Dockable.State>;
    anchorSize?: number;
    resizeHandleSize?: number;
    dividerSize?: number;
    tabHeight?: number;
    dockModifier?: DockModifier;
    onPopOut?: (element: Dockable.ContentElement, title: string, contentId: Dockable.ContentId) => void;
}): React.JSX.Element;
