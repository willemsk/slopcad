import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { commandLineMessagesSignal } from '../state/app-state';
import './command-line.css';

export function CommandLine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const messages = commandLineMessagesSignal.value;

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="command-line-area">
      <div className="command-history" ref={containerRef}>
        {messages.map((msg, i) => (
          <div key={i} className="command-message">{msg}</div>
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
