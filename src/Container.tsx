import * as React from "react";
import * as Dockable from "./index.js";
import styled from "styled-components";

const StyledContainer = styled.div<{}>`
  --dockable-voidBkg: #1a1a1a;
  --dockable-panelBkg: #1e1e1e;
  --dockable-panelInactiveBorder: #333333;
  --dockable-panelActiveBorder: #555555;
  --dockable-panelTabBkg: #272727;
  --dockable-panelTabTextColor: #e8e8e8;
  --dockable-overlayColor: #00aaff18;
  --dockable-anchorColor: #00aaff;
  --dockable-buttonHoverBkg: #3a3a3a;
  --dockable-scrollbarColor: #555555;

  width: 100%;
  height: 100%;
  background-color: var(--dockable-voidBkg);
`;

const StyledContentRoot = styled.div<{
  isCurrentTab: boolean;
}>`
  display: ${(props) => (props.isCurrentTab ? "grid" : "none")};
  grid-template: 100% / 100%;

  position: absolute;
  box-sizing: border-box;
  contain: strict;

  color: #fff;
  text-align: left;

  background-color: transparent;
  overflow: hidden;
`;

const StyledContentInner = styled.div`
  grid-row: 1;
  grid-column: 1;
  width: 100%;
  height: 100%;
`;

const StyledBottomRightResizeHandle = styled.div<{
  size: number;
}>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;

  grid-row: 1;
  grid-column: 1;
  align-self: end;
  justify-self: end;

  cursor: nwse-resize;
  z-index: 1;
  border-radius: 2px 0 0 0;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--dockable-anchorColor);
    opacity: 0.5;
  }
`;

const StyledDivider = styled.div`
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--dockable-anchorColor);
    opacity: 0.5;
  }
`;

export function Container(props: {
  state: Dockable.RefState<Dockable.State>;

  anchorSize?: number;
  resizeHandleSize?: number;
  dividerSize?: number;
  tabHeight?: number;
}) {
  const [rect, setRect] = React.useState(new Dockable.Rect(0, 0, 0, 0));
  const rootRef = React.useRef<HTMLDivElement>(null);

  const anchorSize = props.anchorSize ?? 5;
  const resizeHandleSize = props.resizeHandleSize ?? 10;
  const dividerSize = props.dividerSize ?? 6;
  const tabHeight = props.tabHeight ?? 25;

  React.useLayoutEffect(() => {
    const onResize = () => {
      if (!rootRef.current) return;

      const elemRect = rootRef.current!.getBoundingClientRect();

      setRect(
        new Dockable.Rect(
          elemRect.x,
          elemRect.y,
          elemRect.width,
          elemRect.height
        )
      );
    };

    onResize();

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const rectRef = React.useRef<Dockable.Rect>(null!);
  rectRef.current = rect;

  const layoutRef = React.useRef<Dockable.Layout>(null!);
  layoutRef.current = React.useMemo(() => {
    return Dockable.getLayout(
      props.state.ref.current,
      new Dockable.Rect(rect.x, rect.y, rect.w - 1, rect.h - 1)
    );
  }, [rect, props.state.updateToken]);

  const setTitle = (layoutContent: Dockable.LayoutContent, title: string) => {
    if (layoutContent.content.title != title) {
      window.requestAnimationFrame(() => {
        layoutContent.content.title = title;
        props.state.commit();
      });
    }
  };

  const setPreferredSize = (
    layoutContent: Dockable.LayoutContent,
    width: number,
    height: number
  ) => {
    if (
      layoutContent.tabIndex == layoutContent.panel.currentTabIndex &&
      (width != layoutContent.panel.preferredWidth ||
        height != layoutContent.panel.preferredHeight)
    ) {
      window.requestAnimationFrame(() => {
        layoutContent.panel.preferredWidth = width;
        layoutContent.panel.preferredHeight = height;

        layoutContent.panel.rect = new Dockable.Rect(
          layoutContent.panel.rect.x,
          layoutContent.panel.rect.y,
          width,
          height
        );

        props.state.commit();
      });
    }
  };

  return (
    <StyledContainer ref={rootRef}>
      {layoutRef.current.panelRects.map((panelRect) => (
        <Dockable.ContainerPanel
          key={panelRect.panel.id}
          state={props.state}
          panelRect={panelRect}
          tabHeight={tabHeight}
          onClickPanel={() =>
            handleClickedPanel(props.state, panelRect.panel, null)
          }
          onClickTab={(tabNumber) =>
            handleClickedPanel(props.state, panelRect.panel, tabNumber)
          }
          onCloseTab={(ev, tabNumber) =>
            handleClosedTab(ev, props.state, panelRect.panel, tabNumber)
          }
          onCloseWindow={(ev) =>
            handleCloseWindow(ev, props.state, panelRect.panel)
          }
          onDragHeader={(ev, tabNumber) =>
            handleDraggedHeader(
              ev,
              props.state,
              layoutRef,
              rectRef,
              panelRect.panel,
              tabNumber
            )
          }
          onHidePanel={(ev, hidden) =>
            handleHiddenPanel(props.state, panelRect.panel, hidden)
          }
          onLockPanel={(ev, locked) =>
            handleLockedPanel(props.state, panelRect.panel, locked)
          }
        />
      ))}

      {layoutRef.current.content.map((layoutContent) => (
        <StyledContentRoot
          key={layoutContent.content.contentId}
          isCurrentTab={
            layoutContent.panel.currentTabIndex == layoutContent.tabIndex
          }
          onMouseDown={() =>
            handleClickedPanel(props.state, layoutContent.panel, null)
          }
          style={{
            left: layoutContent.layoutPanel.rect.x + "px",
            top: layoutContent.layoutPanel.rect.y + tabHeight + "px",
            width: layoutContent.layoutPanel.rect.w + "px",
            height: layoutContent.layoutPanel.rect.h - tabHeight + "px",
            zIndex: layoutContent.layoutPanel.zIndex * 3 + 1,
          }}
        >
          <Dockable.ContentContext.Provider
            value={{
              layoutContent,

              setTitle: (title) => setTitle(layoutContent, title),
              setPreferredSize: (w, h) => setPreferredSize(layoutContent, w, h),
            }}
          >
            <StyledContentInner>
              {layoutContent.content.element}
            </StyledContentInner>
          </Dockable.ContentContext.Provider>

          {layoutContent.panel.floating && (
            <StyledBottomRightResizeHandle
              size={resizeHandleSize}
              onMouseDown={(ev) => {
                handleClickedPanel(props.state, layoutContent.panel, null);
                handleDraggedEdge(
                  ev,
                  props.state,
                  layoutRef,
                  layoutContent.panel
                );
              }}
            />
          )}
        </StyledContentRoot>
      ))}

      {layoutRef.current.dividers.map((divider, i) => (
        <StyledDivider
          key={i}
          onMouseDown={(ev) => handleDraggedDivider(ev, props.state, divider)}
          style={{
            width: (divider.rect.w || dividerSize) + "px",
            height: (divider.rect.h || dividerSize) + "px",

            position: "absolute",
            left:
              divider.rect.x - (!divider.vertical ? dividerSize / 2 : 0) + "px",
            top:
              divider.rect.y - (divider.vertical ? dividerSize / 2 : 0) + "px",

            cursor: !divider.vertical ? "ew-resize" : "ns-resize",

            zIndex: 1,
            userSelect: "none",
          }}
        />
      ))}

      {props.state.ref.current.previewAnchor && (
        <div
          style={{
            position: "absolute",
            left: props.state.ref.current.previewAnchor.previewRect.x + "px",
            top: props.state.ref.current.previewAnchor.previewRect.y + "px",
            width:
              props.state.ref.current.previewAnchor.previewRect.w - 1 + "px",
            height:
              props.state.ref.current.previewAnchor.previewRect.h - 1 + "px",

            backgroundColor: "var(--dockable-overlayColor)",
            border: "2px solid var(--dockable-anchorColor)",
            boxSizing: "border-box",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        />
      )}

      {props.state.ref.current.showAnchors &&
        layoutRef.current.anchors.map(
          (anchor, i) =>
            props.state.ref.current.draggedPanel !== anchor.panel && (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: anchor.x - anchorSize + "px",
                  top: anchor.y - anchorSize + "px",
                  width: anchorSize * 2 + "px",
                  height: anchorSize * 2 + "px",
                  borderRadius: "50%",
                  backgroundColor: "var(--dockable-anchorColor)",
                  opacity: 0.85,
                  boxShadow: "0 0 0 3px rgba(0,170,255,0.2)",
                  zIndex: 1001,
                  pointerEvents: "none",
                }}
              />
            )
        )}
    </StyledContainer>
  );
}

function handleDraggedDivider(
  ev: React.MouseEvent<HTMLDivElement, MouseEvent>,
  state: Dockable.RefState<Dockable.State>,
  divider: Dockable.Divider
) {
  ev.preventDefault();

  let latestX = ev.pageX;
  let latestY = ev.pageY;
  let rafId: number | null = null;

  const onMouseMove = (ev: MouseEvent) => {
    latestX = ev.pageX;
    latestY = ev.pageY;

    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      divider.panel.splitSize = Math.max(
        0.05,
        Math.min(
          0.95,
          ((divider.vertical ? latestY : latestX) - divider.resizeMin) /
            (divider.resizeMax - divider.resizeMin)
        )
      );
      state.commit();
    });
  };

  const onMouseUp = () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

function handleDraggedEdge(
  ev: React.MouseEvent<HTMLDivElement, MouseEvent>,
  state: Dockable.RefState<Dockable.State>,
  layout: React.MutableRefObject<Dockable.Layout>,
  panel: Dockable.Panel
) {
  ev.preventDefault();
  ev.stopPropagation();

  const startMouseX = ev.pageX;
  const startMouseY = ev.pageY;

  const layoutPanel = layout.current.panelRects.find((p) => p.panel === panel)!;
  const startPanelRect = layoutPanel.rect;

  let latestX = startMouseX;
  let latestY = startMouseY;
  let rafId: number | null = null;

  const onMouseMove = (ev: MouseEvent) => {
    latestX = ev.pageX;
    latestY = ev.pageY;

    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      panel.rect = new Dockable.Rect(
        startPanelRect.x,
        startPanelRect.y,
        Math.max(150, startPanelRect.w + latestX - startMouseX),
        Math.max(50, startPanelRect.h + latestY - startMouseY)
      );
      state.commit();
    });
  };

  const onMouseUp = () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

function handleDraggedHeader(
  ev: React.MouseEvent<HTMLDivElement, MouseEvent>,
  state: Dockable.RefState<Dockable.State>,
  layout: React.MutableRefObject<Dockable.Layout>,
  containerRect: React.MutableRefObject<Dockable.Rect>,
  draggedPanel: Dockable.Panel,
  draggedTabIndex: number | null
) {
  ev.preventDefault();
  ev.stopPropagation();

  if (draggedPanel.isLocked) return;

  const startMouseX = ev.pageX;
  const startMouseY = ev.pageY;

  const layoutPanel = layout.current.panelRects.find(
    (p) => p.panel === draggedPanel
  )!;
  let startPanelRect = layoutPanel.rect;

  let dragLocked = true;
  let latestX = startMouseX;
  let latestY = startMouseY;
  let rafId: number | null = null;

  const onMouseMove = (ev: MouseEvent) => {
    latestX = ev.pageX;
    latestY = ev.pageY;

    // Start dragging only when mouse moves far enough — run immediately (no RAF)
    if (
      dragLocked &&
      (Math.abs(latestX - startMouseX) > 10 ||
        Math.abs(latestY - startMouseY) > 10)
    ) {
      dragLocked = false;

      const floatingRect = new Dockable.Rect(
        latestX -
          Math.min(draggedPanel.preferredWidth / 2, latestX - startPanelRect.x),
        latestY - (latestY - startPanelRect.y),
        draggedPanel.preferredWidth,
        draggedPanel.preferredHeight
      );

      if (draggedTabIndex !== null && draggedPanel.contentList.length > 1) {
        const content = draggedPanel.contentList[draggedTabIndex];
        Dockable.removeContent(
          state.ref.current,
          draggedPanel,
          content.contentId
        );

        draggedPanel = Dockable.makePanel(state.ref.current);
        Dockable.addContent(state.ref.current, draggedPanel, content);

        Dockable.coallesceEmptyPanels(state.ref.current);

        draggedPanel.rect = startPanelRect = floatingRect;
      } else if (!draggedPanel.floating) {
        const contents = [...draggedPanel.contentList];
        const originalTabIndex = draggedPanel.currentTabIndex;
        for (const content of contents)
          Dockable.removeContent(
            state.ref.current,
            draggedPanel,
            content.contentId
          );

        draggedPanel = Dockable.makePanel(state.ref.current);
        for (const content of contents)
          Dockable.addContent(state.ref.current, draggedPanel, content);

        draggedPanel.currentTabIndex = originalTabIndex;
        Dockable.coallesceEmptyPanels(state.ref.current);

        draggedPanel.rect = startPanelRect = floatingRect;
      }

      state.ref.current.draggedPanel = draggedPanel;
      state.ref.current.showAnchors = true;
      state.commit();
    }

    // Handle actual dragging with RAF throttle
    if (!dragLocked) {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;

        draggedPanel.rect = startPanelRect.displace(
          latestX - startMouseX,
          latestY - startMouseY
        );

        let nearestDistSqr = 50 * 50;
        state.ref.current.previewAnchor = null;

        for (const anchor of layout.current.anchors) {
          if (anchor.panel === draggedPanel) continue;

          const xx = anchor.x - latestX;
          const yy = anchor.y - latestY;
          const distSqr = xx * xx + yy * yy;
          if (distSqr < nearestDistSqr) {
            nearestDistSqr = distSqr;
            state.ref.current.previewAnchor = anchor;
          }
        }

        state.commit();
      });
    }
  };

  const onMouseUp = () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);

    if (state.ref.current.previewAnchor) {
      Dockable.dock(
        state.ref.current,
        draggedPanel,
        state.ref.current.previewAnchor.panel,
        state.ref.current.previewAnchor.mode
      );
    }

    Dockable.clampFloatingPanels(state.ref.current, containerRect.current);
    state.ref.current.draggedPanel = null;
    state.ref.current.showAnchors = false;
    state.ref.current.previewAnchor = null;
    state.commit();
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

function handleClickedPanel(
  state: Dockable.RefState<Dockable.State>,
  clickedPanel: Dockable.Panel,
  tabNumber: number | null
) {
  if (tabNumber !== null) {
    clickedPanel.currentTabIndex = tabNumber;
  }

  Dockable.setPanelActiveAndBringToFront(state.ref.current, clickedPanel);
  state.commit();
}

function handleClosedTab(
  ev: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  state: Dockable.RefState<Dockable.State>,
  panel: Dockable.Panel,
  tabNumber: number
) {
  ev.preventDefault();

  const content = panel.contentList[tabNumber];
  Dockable.removeContent(state.ref.current, panel, content.contentId);
  Dockable.coallesceEmptyPanels(state.ref.current);
  state.commit();
}

function handleCloseWindow(
  ev: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  state: Dockable.RefState<Dockable.State>,
  panel: Dockable.Panel
) {
  ev.preventDefault();

  // Snapshot the list first — removeContent splices the live array,
  // so iterating it directly skips entries.
  const contents = [...panel.contentList];
  for (const { contentId } of contents)
    Dockable.removeContent(state.ref.current, panel, contentId);

  Dockable.coallesceEmptyPanels(state.ref.current);
  state.commit();
}

function handleHiddenPanel(
  state: Dockable.RefState<Dockable.State>,
  panel: Dockable.Panel,
  hidden: boolean
) {
  panel.isHeaderHidden = hidden;
  state.commit();
}

function handleLockedPanel(
  state: Dockable.RefState<Dockable.State>,
  panel: Dockable.Panel,
  locked: boolean
) {
  panel.isLocked = locked;
  state.commit();
}
