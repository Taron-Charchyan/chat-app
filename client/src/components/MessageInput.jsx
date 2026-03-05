import { useState, useRef, useEffect } from 'react';
import EmojiPicker from './EmojiPicker';
import { uploadFile } from '../services/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

export default function MessageInput({ roomId }) {
  const [content, setContent] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const socket = useSocket();
  const typingTimeoutRef = useRef(null);

  const handleTextChange = (e) => {
    setContent(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 96) + 'px';
    }

    // Typing indicator
    if (socket && roomId) {
      socket.emit('typing:start', roomId);

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', roomId);
      }, 1000);
    }
  };

  const handleSend = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (!content.trim() || !socket || !roomId) return;

    socket.emit('message:send', {
      roomId,
      content: content.trim(),
      type: 'text',
    });

    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !socket || !roomId) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadFile(formData);
      const { fileUrl, fileName, fileSize } = response.data;

      const isImage = file.type.startsWith('image/');

      socket.emit('message:send', {
        roomId,
        content: '',
        type: isImage ? 'image' : 'file',
        fileUrl,
        fileName,
        fileSize,
      });

      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="p-4 border-t border-white border-opacity-10">
      {showEmoji && (
        <div className="mb-4">
          <EmojiPicker
            onEmojiSelect={(emoji) => {
              setContent(content + emoji);
              setShowEmoji(false);
            }}
            onClose={() => setShowEmoji(false)}
          />
        </div>
      )}

      <div className="flex gap-2 items-end">
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="p-2 hover:bg-dark-card rounded-lg transition text-xl"
          title="Emoji"
        >
          😊
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 hover:bg-dark-card rounded-lg transition text-xl disabled:opacity-50"
          title="Upload file or image"
        >
          📎
        </button>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.zip"
          className="hidden"
        />

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onKeyDown={handleSend}
          placeholder="Type a message... (Shift+Enter for newline)"
          className="flex-1 px-4 py-2 bg-dark-card border border-white border-opacity-10 rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none max-h-24"
          rows="1"
        />

        <button
          onClick={sendMessage}
          disabled={!content.trim() || uploading}
          className="p-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-xl"
          title="Send message"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
