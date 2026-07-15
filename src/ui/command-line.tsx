import {h} from 'preact';
import {useEffect, useRef, useState} from 'preact/hooks';
import {
  activePromptSignal,
  commandLineMessagesSignal,
  isLayerModalOpenSignal,
  pushCommandMessage,
} from '../state/ui-state';
import {dispatchCommand} from '../tools/commands';
import './command-line.css';

export function CommandLine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messages = commandLineMessagesSignal.value;
  const [height, setHeight] = useState(72);
  const [isDragging, setIsDragging] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const dragRef = useRef({startY: 0, startHeight: 72});

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, height]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in a different input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        activePromptSignal.value !== null ||
        isLayerModalOpenSignal.value
      ) {
        return;
      }

      // If it's a single printable character and no modifiers
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

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

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Prevent spacebar from adding a space if we are executing
      e.preventDefault();

      const val = inputValue.trim();
      if (val) {
        dispatchCommand(val);
        setInputValue('');
      }
      // Yield focus back to document
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  return (
    <div className="command-line-area" style={{height: `${height}px`}}>
      <div
        className="command-line-drag-handle"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="drag-lines" />
      </div>
      <div className="command-history" ref={containerRef}>
        {messages.map((msg, i) => (
          <div key={i} className="command-message">
            {msg}
          </div>
        ))}
      </div>
      <div className="command-prompt-bar">
        <label htmlFor="command-line-input" className="command-prompt-label">Command:</label>
        <input
          ref={inputRef}
          id="command-line-input"
          type="text"
          className="command-prompt-input"
          placeholder="Type a command or press a shortcut..."
          value={inputValue}
          disabled={isLayerModalOpenSignal.value}
          onInput={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
