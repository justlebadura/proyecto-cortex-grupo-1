import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

/**
 * LiveLatexInput
 * 
 * A component that behaves like an input field but renders LaTeX preview when not focused.
 * This mimics a "Notion-like" experience where math is rendered in-place.
 * 
 * Usage:
 * <LiveLatexInput 
 *   value={text} 
 *   onChange={setText} 
 *   placeholder="Type text and math..." 
 *   ref={inputRef} // Can be used to focus the input
 * />
 */
const LiveLatexInput = forwardRef(({ 
  value, 
  onChange, 
  placeholder, 
  className = "",
  inputClassName = "",
  autoFocus = false,
  onKeyDown
}, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const internalInputRef = useRef(null);

  // Expose focus method to parent via ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      setIsEditing(true);
      setTimeout(() => {
        internalInputRef.current?.focus();
      }, 0);
    },
    // Expose the raw input element so parent can manipulate selection/cursor
    get inputElement() {
      return internalInputRef.current;
    }
  }));

  // Auto-focus when switching to edit mode via click or prop
  useEffect(() => {
    if (isEditing && internalInputRef.current) {
        internalInputRef.current.focus();
    }
  }, [isEditing]);

  // Handle initial autoFocus prop
  useEffect(() => {
    if(autoFocus) {
      setIsEditing(true);
    }
  }, [autoFocus]);

  const handleBlur = () => setIsEditing(false);

  return (
    <div 
      className={`relative w-full group ${className}`}
      onClick={() => {
        if (!isEditing) {
            setIsEditing(true);
        }
      }}
    >
      {isEditing ? (
        <input
          ref={internalInputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`w-full bg-transparent outline-none border-none focus:ring-0 ${inputClassName}`}
          autoFocus={true}
        />
      ) : (
        <div className={`w-full cursor-text min-h-[1.5em] flex items-center overflow-hidden text-ellipsis whitespace-nowrap ${inputClassName}`}>
          {value ? (
            <span className="pointer-events-none text-white truncate w-full">
              <Latex>{value}</Latex>
            </span>
          ) : (
            <span className="text-gray-600 italic select-none">{placeholder}</span>
          )}
        </div>
      )}
    </div>
  );
});

LiveLatexInput.displayName = 'LiveLatexInput';

export default LiveLatexInput;

