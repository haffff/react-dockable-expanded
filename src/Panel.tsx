import * as React from "react";
import * as Dockable from "./index.js";
import styled from "styled-components";

import { FaEye, FaLock, FaLockOpen, FaRegEye } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const StyledPanelRoot = styled.div`
  position: absolute;
  box-sizing: border-box;
  contain: strict;
`;

const StyledTabRow = styled.div`
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

const StyledTabRowInner = styled.div<{
  tabHeight: number;
  tabCount: number;
}>`
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

const StyledTab = styled.div<{
  tabNumber: number;
  isCurrentTab: boolean;
}>`
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
  background-color: ${(props) =>
    props.isCurrentTab
      ? "var(--dockable-panelBkg)"
      : "var(--dockable-panelTabBkg)"};
`;

const StyledButton = styled.button<{
  isCurrentTab: boolean;
}>`
  pointer-events: auto;
  border: 0;
  border-radius: 0.25em;
  background-color: transparent;
  padding: 0.1em 0.3em;
  cursor: pointer;
  margin-left: 0.25em;
  width: 1.5em;
  height: 1.5em;

  color: ${(props) =>
    props.isCurrentTab ? "var(--dockable-panelTabTextColor)" : "transparent"};

  &:hover {
    background-color: var(--dockable-buttonHoverBkg);
    color: var(--dockable-panelTabTextColor);
  }

  &:active {
    background-color: var(--dockable-buttonHoverBkg);
    color: var(--dockable-panelTabTextColor);
  }
`;

const StyledTabRowEmptySpace = styled.div`
  min-width: 2em;
  pointer-events: none;
  display: flex;
  flex-direction: row-reverse;
`;

export function ContainerPanel(props: {
  state: Dockable.RefState<Dockable.State>;
  panelRect: Dockable.LayoutPanel;
  tabHeight: number;
  onClickPanel: () => void;
  onClickTab: (tabNumber: number) => void;
  onCloseTab: (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    tabNumber: number
  ) => void;
  onDragHeader: (
    ev: React.MouseEvent<HTMLDivElement, MouseEvent>,
    tabNumber: number | null
  ) => void;
  onCloseWindow: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onLockPanel: (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    locked: boolean
  ) => void;
  onHidePanel: (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    hidden: boolean
  ) => void;
}) {
  const panelRect: Dockable.LayoutPanel = props.panelRect;

  const isActivePanel = props.state.ref.current.activePanel === panelRect.panel;
  const hiddenTabRow = props.panelRect.panel.isHeaderHidden;
  const isRootPanel =
    props.panelRect.panel === props.state.ref.current.rootPanel;
  const isLocked = props.panelRect.panel.isLocked;

  const generateInnerTabRow = () => {
    return (
      <StyledTabRowInner
        draggable
        tabHeight={props.tabHeight}
        tabCount={panelRect.panel.contentList.length}
        onMouseDown={(ev) => {
          props.onClickPanel();
          props.onDragHeader(ev, null);
        }}
      >
        {panelRect.panel.contentList.map((content, tabNumber) => (
          <StyledTab
            key={content.contentId}
            tabNumber={tabNumber}
            isCurrentTab={panelRect.panel.currentTabIndex == tabNumber}
            onMouseDown={(ev) => {
              props.onClickTab(tabNumber);
              props.onDragHeader(ev, tabNumber);
            }}
          >
            <span>{content.title || `Content ${content.contentId}`}</span>
            <StyledButton
              title="Close Tab"
              isCurrentTab={panelRect.panel.currentTabIndex == tabNumber}
              onClick={(ev) => {
                props.onClickTab(tabNumber);
                props.onCloseTab(ev, tabNumber);
              }}
            >
              <IoClose />
            </StyledButton>
          </StyledTab>
        ))}
        <StyledTabRowEmptySpace>
          {!isRootPanel && (
            <>
              <StyledButton
                title="Close Panel"
                isCurrentTab={true}
                onClick={(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                  props.onCloseWindow(ev);
                }}
              >
                <IoClose />
              </StyledButton>
              <StyledButton
                title={!isLocked ? "Lock Panel" : "Unlock Panel"}
                isCurrentTab={true}
                onClick={(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                  props.onLockPanel(ev, !isLocked);
                }}
              >
                {isLocked ? <FaLockOpen size={8} /> : <FaLock size={8} />}
              </StyledButton>
              <StyledButton
                title={"Hide Header"}
                isCurrentTab={true}
                onClick={(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                  props.onHidePanel(ev, !hiddenTabRow);
                }}
              >
                <FaRegEye size={8} />
              </StyledButton>
            </>
          )}
        </StyledTabRowEmptySpace>
      </StyledTabRowInner>
    );
  };

  const generateCompactModeSwitch = () => {
    return (
      <StyledButton
        title="Show Header"
        style={{ position: "absolute", right: 2 }}
        isCurrentTab={true}
        onClick={(ev) => {
          props.onHidePanel(ev, !hiddenTabRow);
        }}
      >
        <FaEye size={8} style={{ color: "gray" }} />
      </StyledButton>
    );
  };

  
  const generateCompactTabRow = () => {
    if (panelRect.panel.contentList.length === 1) {
      return <>{generateCompactModeSwitch()}</>;
    }

    let hasNext =
      panelRect.panel.currentTabIndex < panelRect.panel.contentList.length - 1;
    let hasPrev = panelRect.panel.currentTabIndex > 0;

    return (
      <StyledTabRowInner
        tabHeight={props.tabHeight}
        tabCount={panelRect.panel.contentList.length}
        onMouseDown={(ev) => {
          props.onClickPanel();
          props.onDragHeader(ev, null);
        }}
      >
        <StyledButton
          onClick={() => {
            if (hasPrev) {
              props.onClickTab(panelRect.panel.currentTabIndex - 1);
            }
          }}
          isCurrentTab={true}
        >
          {"<"}
        </StyledButton>
        <StyledButton isCurrentTab={true}>
          {panelRect.panel.currentTabIndex + 1}
        </StyledButton>
        <StyledButton
          onClick={() => {
            if (hasNext) {
              props.onClickTab(panelRect.panel.currentTabIndex + 1);
            }
          }}
          isCurrentTab={true}
        >
          {">"}
        </StyledButton>
        {generateCompactModeSwitch()}
      </StyledTabRowInner>
    );
  };

  return (
    <StyledPanelRoot
      style={{
        left: `${panelRect.rect.x}px`,
        top: `${panelRect.rect.y}px`,
        width: `${panelRect.rect.w + 1}px`,
        height: `${panelRect.rect.h + 1}px`,
        zIndex: panelRect.zIndex * 3 + (isActivePanel ? 1 : 0),
      }}
    >
      <StyledTabRow className={isActivePanel ? "active" : undefined}>
        {!hiddenTabRow ? generateInnerTabRow() : generateCompactTabRow()}
      </StyledTabRow>
    </StyledPanelRoot>
  );
}
