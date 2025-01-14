import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="layout">
      {children}
      <style jsx global>{`
        :root {
          --primary-color: #0070f3;
          --primary-color-dark: #0051a2;
          --text-color: #333;
          --background-color: #fff;
        }
        
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
          background: var(--background-color);
          color: var(--text-color);
        }

        * {
          box-sizing: border-box;
        }

        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
} 