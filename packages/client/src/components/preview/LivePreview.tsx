import React, { useRef, useEffect } from 'react';
import * as Babel from '@babel/core';

interface LivePreviewProps {
  code: string;
  css: string;
}

const LivePreview: React.FC<LivePreviewProps> = ({ code, css }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const result = Babel.transformSync(code, {
        presets: ['react'],
        plugins: ['@babel/plugin-transform-modules-commonjs'],
      });

      if (result && result.code !== undefined && result.code !== null) {
        iframe.contentWindow?.postMessage({ type: 'CODE', code: result.code, css }, '*');
      } else {
        console.error('Babel transformation returned unexpected result:', result);
        iframe.contentWindow?.postMessage({ type: 'ERROR', message: 'Code transformation failed: Invalid Babel result' }, '*');
      }
    } catch (error: any) {
      console.error('Babel transformation error:', error);
      iframe.contentWindow?.postMessage({ type: 'ERROR', message: `Code transformation failed: ${error.message || error}` }, '*');
    }
  }, [code, css]);

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
