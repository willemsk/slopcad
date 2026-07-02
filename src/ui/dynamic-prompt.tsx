import {h} from 'preact';
import {useEffect, useRef, useState} from 'preact/hooks';
import {activePromptSignal} from '../state/ui-state';
import './dynamic-prompt.css';

export function DynamicPrompt() {
  const prompt = activePromptSignal.value;
  const inputRef = useRef<HTMLInputElement>(null);
  const [val, setVal] = useState('');

  useEffect(() => {
    if (prompt) {
      setVal(prompt.initialValue);
      // Small delay to ensure render before focus
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 10);
    }
  }, [prompt]);

  if (!prompt) return null;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      prompt.resolve(val);
    } else if (e.key === 'Escape') {
      prompt.resolve(null);
    }
    e.stopPropagation();
  };

  const isCentered = !prompt.position;

  const style: any = isCentered
    ? {} // CSS handles centering
    : {
        left: `${prompt.position!.x}px`,
        top: `${prompt.position!.y}px`,
        transform: 'translate(10px, -50%)', // Offset slightly to the right of the cursor/point
      };

  return (
    <div
      className={`dynamic-prompt-overlay ${isCentered ? 'centered' : 'floating'}`}
      onClick={() => prompt.resolve(null)}
      onContextMenu={e => {
        e.preventDefault();
        prompt.resolve(null);
      }}
    >
      <div
        className="dynamic-prompt-box"
        style={style}
        onClick={e => e.stopPropagation()}
      >
        <span className="prompt-message">{prompt.message}</span>
        <input
          ref={inputRef}
          type="text"
          value={val}
          onInput={e => setVal(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          className="prompt-input"
        />
      </div>
    </div>
  );
}
