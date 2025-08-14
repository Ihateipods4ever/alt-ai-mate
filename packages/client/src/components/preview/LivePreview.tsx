import React, { useRef, useEffect } from 'react';

interface LivePreviewProps {
  code: string;
  css: string;
}

const LivePreview: React.FC<LivePreviewProps> = ({ code, css }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Send code to backend for transformation
    fetch('/api/transform-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, css }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code) {
          // Send transformed code and original css to iframe
          iframe.contentWindow?.postMessage({ type: 'CODE', code: data.code, css: data.css }, '*');
        } else if (data.error) {
          console.error('Backend transformation error:', data.error);
          // Send error message to iframe
          iframe.contentWindow?.postMessage({ type: 'ERROR', message: `Code transformation failed: ${data.details || data.error}` }, '*');
        }
      })
      .catch((error) => {
        console.error('Fetch error during transformation:', error);
        // Send fetch error to iframe
        iframe.contentWindow?.postMessage({ type: 'ERROR', message: `Code transformation failed: ${error.message || error}` }, '*');
      });

  }, [code, css]); // Depend on code and css changes

  return (
    <iframe
      ref={iframeRef}
      title="Live Preview"
      className="w-full h-full bg-white border rounded-md shadow-inner"
      sandbox="allow-scripts allow-same-origin"
    />
  );
};

export default LivePreview;
