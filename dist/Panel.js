import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import styled from "styled-components";
import { FaEye, FaLock, FaLockOpen, FaRegEye } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
const StyledPanelRoot = styled.div `
  position: absolute;
  box-sizing: border-box;
  contain: strict;
`;
const StyledTabRow = styled.div `
  background-color: var(--dockable-panelBkg);
  box-sizing: border-box;
  width: 100%;
  height: 100%;

  display: grid;
  grid-template: auto 1fr / 1fr;
  overflow: hidden;

  border: 1px solid var(--dockable-panelInactiveBorder);

  &.active {
    border: 1px solid var(--dockable-panelActiveBorder);
  }
`;
const StyledTabRowInner = styled.div `
  background-color: var(--dockable-voidBkg);
  text-align: left;
  grid-row: 1;
  grid-column: 1;

  display: grid;
  grid-template: ${(props) => props.tabHeight}px / repeat(
      ${(props) => props.tabCount},
      auto
    ) 1fr;
  grid-auto-flow: column;

  height: ${(props) => props.tabHeight}px;

  overflow-x: auto;
  overflow-y: hidden;
  user-select: none;

  &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: var(--dockable-panelBkg);
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--dockable-scrollbarColor);
    border-radius: 0;
    border: 0;
  }
`;
const StyledTab = styled.div `
  grid-row: 1;
  grid-column: ${(props) => props.tabNumber + 1};

  display: grid;
  grid-template: auto / auto auto;
  justify-items: start;
  align-items: center;

  min-width: max-content;
  height: 100%;
  box-sizing: border-box;
  margin-right: 1px;
  padding-left: 0.75em;
  padding-right: 0.5em;
  user-select: none;

  color: var(--dockable-panelTabTextColor);
  background-color: ${(props) => props.isCurrentTab
    ? "var(--dockable-panelBkg)"
    : "var(--dockable-panelTabBkg)"};
`;
const StyledButton = styled.button `
  pointer-events: auto;
  border: 0;
  border-radius: 0.25em;
  background-color: transparent;
  padding: 0.1em 0.3em;
  cursor: pointer;
  margin-left: 0.25em;
  width: 1.5em;
  height: 1.5em;

  color: ${(props) => props.isCurrentTab ? "var(--dockable-panelTabTextColor)" : "transparent"};

  &:hover {
    background-color: var(--dockable-buttonHoverBkg);
    color: var(--dockable-panelTabTextColor);
  }

  &:active {
    background-color: var(--dockable-buttonHoverBkg);
    color: var(--dockable-panelTabTextColor);
  }
`;
const StyledTabRowEmptySpace = styled.div `
  min-width: 2em;
  pointer-events: none;
`;
export function ContainerPanel(props) {
    const panelRect = props.panelRect;
    const isActivePanel = props.state.ref.current.activePanel === panelRect.panel;
    const hiddenTabRow = props.panelRect.panel.isHeaderHidden;
    const isRootPanel = props.panelRect.panel === props.state.ref.current.rootPanel;
    const isLocked = props.panelRect.panel.isLocked;
    const generateInnerTabRow = () => {
        return (_jsxs(StyledTabRowInner, { draggable: true, tabHeight: props.tabHeight, tabCount: panelRect.panel.contentList.length, onMouseDown: (ev) => {
                props.onClickPanel();
                props.onDragHeader(ev, null);
            }, children: [panelRect.panel.contentList.map((content, tabNumber) => (_jsxs(StyledTab, { tabNumber: tabNumber, isCurrentTab: panelRect.panel.currentTabIndex == tabNumber, onMouseDown: (ev) => {
                        props.onClickTab(tabNumber);
                        props.onDragHeader(ev, tabNumber);
                    }, children: [_jsx("span", { children: content.title || `Content ${content.contentId}` }), _jsx(StyledButton, { title: "Close Tab", isCurrentTab: panelRect.panel.currentTabIndex == tabNumber, onClick: (ev) => {
                                props.onClickTab(tabNumber);
                                props.onCloseTab(ev, tabNumber);
                            }, children: _jsx(IoClose, {}) })] }, content.contentId))), _jsx(StyledTabRowEmptySpace, { children: !isRootPanel && (_jsxs(_Fragment, { children: [_jsx(StyledButton, { title: "Close Panel", isCurrentTab: true, onClick: (ev) => {
                                    props.onCloseWindow(ev);
                                }, children: _jsx(IoClose, {}) }), _jsx(StyledButton, { title: !isLocked ? "Lock Panel" : "Unlock Panel", isCurrentTab: true, onClick: (ev) => {
                                    props.onLockPanel(ev, !isLocked);
                                }, children: isLocked ? _jsx(FaLockOpen, { size: 8 }) : _jsx(FaLock, { size: 8 }) }), _jsx(StyledButton, { title: "Hide Header", isCurrentTab: true, onClick: (ev) => {
                                    props.onHidePanel(ev, !hiddenTabRow);
                                }, children: _jsx(FaRegEye, { size: 8 }) })] })) })] }));
    };
    const generateCompactModeSwitch = () => {
        return (_jsx(StyledButton, { title: "Show Header", style: { position: "absolute", right: 2 }, isCurrentTab: true, onClick: (ev) => {
                props.onHidePanel(ev, !hiddenTabRow);
            }, children: _jsx(FaEye, { size: 8, style: { color: "gray" } }) }));
    };
    const generateCompactTabRow = () => {
        if (panelRect.panel.contentList.length === 1) {
            return _jsx(_Fragment, { children: generateCompactModeSwitch() });
        }
        let hasNext = panelRect.panel.currentTabIndex < panelRect.panel.contentList.length - 1;
        let hasPrev = panelRect.panel.currentTabIndex > 0;
        return (_jsxs(StyledTabRowInner, { tabHeight: props.tabHeight, tabCount: panelRect.panel.contentList.length, onMouseDown: (ev) => {
                props.onClickPanel();
                props.onDragHeader(ev, null);
            }, children: [_jsx(StyledButton, { onClick: () => {
                        if (hasPrev) {
                            props.onClickTab(panelRect.panel.currentTabIndex - 1);
                        }
                    }, isCurrentTab: true, children: "<" }), _jsx(StyledButton, { isCurrentTab: true, children: panelRect.panel.currentTabIndex + 1 }), _jsx(StyledButton, { onClick: () => {
                        if (hasNext) {
                            props.onClickTab(panelRect.panel.currentTabIndex + 1);
                        }
                    }, isCurrentTab: true, children: ">" }), generateCompactModeSwitch()] }));
    };
    return (_jsx(StyledPanelRoot, { style: {
            left: `${panelRect.rect.x}px`,
            top: `${panelRect.rect.y}px`,
            width: `${panelRect.rect.w + 1}px`,
            height: `${panelRect.rect.h + 1}px`,
            zIndex: panelRect.zIndex * 3 + (isActivePanel ? 1 : 0),
        }, children: _jsx(StyledTabRow, { className: isActivePanel ? "active" : undefined, children: !hiddenTabRow ? generateInnerTabRow() : generateCompactTabRow() }) }));
}
//# sourceMappingURL=Panel.js.map