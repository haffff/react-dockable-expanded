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
    /**
     * Extra items for a panel's ⋯ header menu, about the panel's current tab. Called each time
     * the menu opens; return [] for none. Shown after "Pop out to window".
     */
    menuItems?: (content: Dockable.Content) => ContainerMenuItem[];
}): React.JSX.Element;
/** An extra entry of a panel's ⋯ header menu (Container's menuItems). */
export interface ContainerMenuItem {
    label: string;
    onClick: () => void;
}
