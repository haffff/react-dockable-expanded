import * as React from "react";
import styled from "styled-components";
import { FaEye, FaLock, FaLockOpen, FaRegEye, FaExternalLinkAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
const StyledPanelRoot = styled.div `
  position: absolute;
  box-sizing: border-box;
  contain: strict;
  ${(props) => props.floating &&
    `box-shadow: 0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.35);`}
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
  transition: border-color 0.15s ease;

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
    border-radius: 2px;
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

  border-bottom: 2px solid
    ${(props) => props.isCurrentTab ? "var(--dockable-anchorColor)" : "transparent"};

  transition: background-color 0.1s ease, border-color 0.1s ease;
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

  color: ${(props) => props.isCurrentTab
    ? "var(--dockable-panelTabTextColor)"
    : "rgba(255,255,255,0.2)"};

  transition: background-color 0.1s ease, color 0.1s ease;

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
  display: flex;
  flex-direction: row-reverse;
`;
export function ContainerPanel(props) {
    const panelRect = props.panelRect;
    const isActivePanel = props.state.ref.current.activePanel === panelRect.panel;
    const hiddenTabRow = props.panelRect.panel.isHeaderHidden;
    const isRootPanel = props.panelRect.panel === props.state.ref.current.rootPanel;
    const isLocked = props.panelRect.panel.isLocked;
    const generateInnerTabRow = () => {
        return (React.createElement(StyledTabRowInner, { draggable: true, tabHeight: props.tabHeight, tabCount: panelRect.panel.contentList.length, onMouseDown: (ev) => {
                props.onClickPanel();
                props.onDragHeader(ev, null);
            } },
            panelRect.panel.contentList.map((content, tabNumber) => (React.createElement(StyledTab, { key: content.contentId, tabNumber: tabNumber, isCurrentTab: panelRect.panel.currentTabIndex == tabNumber, onMouseDown: (ev) => {
                    props.onClickTab(tabNumber);
                    props.onDragHeader(ev, tabNumber);
                } },
                React.createElement("span", null, content.title || `Content ${content.contentId}`),
                React.createElement(StyledButton, { title: "Close Tab", isCurrentTab: panelRect.panel.currentTabIndex == tabNumber, onClick: (ev) => {
                        props.onClickTab(tabNumber);
                        props.onCloseTab(ev, tabNumber);
                    } },
                    React.createElement(IoClose, null))))),
            React.createElement(StyledTabRowEmptySpace, null, !isRootPanel && (React.createElement(React.Fragment, null,
                React.createElement(StyledButton, { title: "Pop Out to Window", isCurrentTab: true, onClick: (ev) => {
                        props.onPopOut(ev);
                    } },
                    React.createElement(FaExternalLinkAlt, { size: 8 })),
                React.createElement(StyledButton, { title: "Close Panel", isCurrentTab: true, onClick: (ev) => {
                        props.onCloseWindow(ev);
                    } },
                    React.createElement(IoClose, null)),
                React.createElement(StyledButton, { title: !isLocked ? "Lock Panel" : "Unlock Panel", isCurrentTab: true, onClick: (ev) => {
                        props.onLockPanel(ev, !isLocked);
                    } }, isLocked ? React.createElement(FaLockOpen, { size: 8 }) : React.createElement(FaLock, { size: 8 })),
                React.createElement(StyledButton, { title: "Hide Header", isCurrentTab: true, onClick: (ev) => {
                        props.onHidePanel(ev, !hiddenTabRow);
                    } },
                    React.createElement(FaRegEye, { size: 8 })))))));
    };
    const generateCompactModeSwitch = () => {
        return (React.createElement(StyledButton, { title: "Show Header", style: { position: "absolute", right: 2 }, isCurrentTab: true, onClick: (ev) => {
                props.onHidePanel(ev, !hiddenTabRow);
            } },
            React.createElement(FaEye, { size: 8, style: { color: "gray" } })));
    };
    const generateCompactTabRow = () => {
        if (panelRect.panel.contentList.length === 1) {
            return React.createElement(React.Fragment, null, generateCompactModeSwitch());
        }
        let hasNext = panelRect.panel.currentTabIndex < panelRect.panel.contentList.length - 1;
        let hasPrev = panelRect.panel.currentTabIndex > 0;
        return (React.createElement(StyledTabRowInner, { tabHeight: props.tabHeight, tabCount: panelRect.panel.contentList.length, onMouseDown: (ev) => {
                props.onClickPanel();
                props.onDragHeader(ev, null);
            } },
            React.createElement(StyledButton, { onClick: () => {
                    if (hasPrev) {
                        props.onClickTab(panelRect.panel.currentTabIndex - 1);
                    }
                }, isCurrentTab: true }, "<"),
            React.createElement(StyledButton, { isCurrentTab: true }, panelRect.panel.currentTabIndex + 1),
            React.createElement(StyledButton, { onClick: () => {
                    if (hasNext) {
                        props.onClickTab(panelRect.panel.currentTabIndex + 1);
                    }
                }, isCurrentTab: true }, ">"),
            generateCompactModeSwitch()));
    };
    return (React.createElement(StyledPanelRoot, { floating: panelRect.floating, style: {
            left: `${panelRect.rect.x}px`,
            top: `${panelRect.rect.y}px`,
            width: `${panelRect.rect.w + 1}px`,
            height: `${panelRect.rect.h + 1}px`,
            zIndex: panelRect.zIndex * 3 + (isActivePanel ? 1 : 0),
        } },
        React.createElement(StyledTabRow, { className: isActivePanel ? "active" : undefined }, !hiddenTabRow ? generateInnerTabRow() : generateCompactTabRow())));
}
//# sourceMappingURL=Panel.js.map