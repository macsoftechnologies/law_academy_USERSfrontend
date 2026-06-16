import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Loader from './Loader';

// Set up worker locally for Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PdfViewer({ url, onScrollEnd }) {
  const [numPages, setNumPages] = useState(null);
  const scrollRef = useRef(null);
  const endSent = useRef(false);

  useEffect(() => {
    endSent.current = false;
  }, [url]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF Load Error:', error);
  };

  const handleScroll = (e) => {
    if (endSent.current || !onScrollEnd) return;
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Trigger when within 50px of the bottom
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      endSent.current = true;
      onScrollEnd();
    }
  };

  if (!url) return null;

  return (
    <div 
      ref={scrollRef} 
      onScroll={handleScroll}
      style={{ 
        height: '620px', 
        overflowY: 'auto', 
        background: '#e0e0e0', 
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', 
        position: 'relative'
      }}
    >
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={<div style={{ padding: '2rem', textAlign: 'center' }}><Loader /></div>}
        error={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)' }}>Failed to load PDF. Check console for details.</div>}
      >
        {numPages && Array.from(new Array(numPages), (el, index) => (
          <div key={`page_${index + 1}`} style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Page 
              pageNumber={index + 1} 
              width={Math.min(window.innerWidth - 60, 800)} // Responsive width
            />
          </div>
        ))}
      </Document>
    </div>
  );
}
