import { useEffect, useRef, useCallback, useState } from "react";
import {
  boxesIntersect,
  useSelectionContainer,
} from "@air/react-drag-to-select";
import "./App.css";

function App() {
  const [container, setContainer] = useState(null);
  const iframeRef = useRef(null);
  const selectableItems = useRef([]);

  const { DragSelection } = useSelectionContainer({
    eventsElement: container,
    onSelectionChange: (box) => {
      const scrollAwareBox = {
        ...box,
        top: box.top + window.scrollY,
        left: box.left + window.scrollX,
      };
      const iframeRect = iframeRef.current.getBoundingClientRect();
      const iframeScrollTop = iframeRef.current.contentWindow.scrollY;
      const iframeScrollLeft = iframeRef.current.contentWindow.scrollX;

      selectableItems.current.forEach(({ element, box: itemBox }) => {
        const scrollAwareItemBox = {
          ...itemBox,
          top: itemBox.top + iframeRect.top - iframeScrollTop + window.scrollY,
          left:
            itemBox.left + iframeRect.left - iframeScrollLeft + window.scrollX,
        };
        const isIntersecting = boxesIntersect(
          scrollAwareBox,
          scrollAwareItemBox
        );
        element.style.backgroundColor = isIntersecting ? "yellow" : "";
      });
    },
    selectionProps: {
      style: {
        border: "2px dashed purple",
        borderRadius: 4,
        backgroundColor: "brown",
        opacity: 0.5,
      },
    },
    isEnabled: true,
  });

  const updateSelectableItems = useCallback(() => {
    const iframeWindow = iframeRef.current.contentWindow;
    const taggableElements =
      iframeRef.current.contentDocument.querySelectorAll(".taggable");
    selectableItems.current = Array.from(taggableElements).map((element) => {
      element.style.border = "2px solid purple";
      const { top, left, width, height } = element.getBoundingClientRect();
      return {
        element,
        box: {
          top: top + iframeWindow.scrollY,
          left: left + iframeWindow.scrollX,
          width,
          height,
        },
      };
    });
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateSelectableItems);
    return () => window.removeEventListener("resize", updateSelectableItems);
  }, [updateSelectableItems]);

  return (
    <div className="wrapper">
      <div ref={setContainer} className="frameWrapper">
        <DragSelection />
        <iframe
          ref={iframeRef}
          className="frame"
          src={`/iframe-content.html`}
          onLoad={updateSelectableItems}
        />
      </div>
    </div>
  );
}

export default App;
