import {h} from 'preact';
import {useEffect, useRef, useState} from 'preact/hooks';
import {commandLineMessagesSignal} from '../state/app-state';
import './command-line.css';

export function CommandLine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const messages = commandLineMessagesSignal.value;
  const [height, setHeight] = useState(72);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({startY: 0, startHeight: 72});

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, height]);

  const handlePointerDown = (e: PointerEvent) => {
    setIsDragging(true);
    dragRef.current = {startY: e.clientY, startHeight: height};
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    const dy = e.clientY - dragRef.current.startY;
    setHeight(Math.max(32, Math.min(600, dragRef.current.startHeight - dy)));
  };

  const handlePointerUp = (e: PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="command-line-area" style={{height: `${height}px`}}>
      <div
        className="command-line-drag-handle"
        onPointerDown={handlePointerDown as any}
        onPointerMove={handlePointerMove as any}
        onPointerUp={handlePointerUp as any}
        onPointerCancel={handlePointerUp as any}
      >
        <div className="drag-lines"></div>
      </div>
      <div className="command-history" ref={containerRef}>
        {messages.map((msg, i) => (
          <div key={i} className="command-message">
            {msg}
          </div>
        ))}
      </div>
      <div className="command-prompt-bar">
        <span className="command-prompt-label">Command:</span>
        <input
          type="text"
          className="command-prompt-input"
          placeholder="Use tools from the ribbon, double-click or drag on the canvas..."
          readOnly
        />
      </div>
    </div>
  );
}
