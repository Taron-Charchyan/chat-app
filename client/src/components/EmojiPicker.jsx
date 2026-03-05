import EmojiPicker from 'emoji-picker-react';
import { useEffect, useRef } from 'react';

export default function EmojiPickerWrapper({ onEmojiSelect, onClose }) {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div ref={pickerRef} className="absolute bottom-20 left-0 z-50">
      <EmojiPicker
        onEmojiClick={(emojiObject) => {
          onEmojiSelect(emojiObject.emoji);
        }}
        theme="dark"
      />
    </div>
  );
}
