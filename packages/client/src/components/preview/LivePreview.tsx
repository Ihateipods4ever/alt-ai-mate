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

    const postMessage = () => {
      iframe.contentWindow?.postMessage({ code, css }, '*');
    };

    // Post message when the iframe has loaded
    iframe.onload = postMessage;

    // Or if it's already loaded, post immediately
    if (iframe.contentWindow) {
      postMessage();
    }
  }, [code, css]);

  return (
    <iframe
      ref={iframeRef}
      src="/src/components/preview/preview.html"
      title="Live Preview"
      className="w-full h-full bg-white border rounded-md shadow-inner"
      sandbox="allow-scripts"
    />
  );
};

export default LivePreview;
