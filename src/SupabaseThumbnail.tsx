import React from 'react';
import { AbsoluteFill } from 'remotion';

export const SupabaseThumbnail: React.FC = () => {
  // File icon component
  const FileIcon: React.FC<{ color: string; top: string; left: string; delay?: number }> = ({ color, top, left }) => (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        width: '100px',
        height: '120px',
      }}
    >
      {/* File body */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: color,
          borderRadius: '8px',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          position: 'relative',
        }}
      >
        {/* File corner fold */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '0',
            height: '0',
            borderStyle: 'solid',
            borderWidth: '0 30px 30px 0',
            borderColor: 'transparent rgba(0, 0, 0, 0.2) transparent transparent',
          }}
        />
      </div>
    </div>
  );

  // Folder icon component
  const FolderIcon: React.FC<{ top: string; left: string; scale?: number }> = ({ top, left, scale = 1 }) => (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        transform: `scale(${scale})`,
      }}
    >
      {/* Folder tab */}
      <div
        style={{
          width: '80px',
          height: '20px',
          backgroundColor: '#3ECF8E',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          marginBottom: '-2px',
        }}
      />
      {/* Folder body */}
      <div
        style={{
          width: '140px',
          height: '100px',
          backgroundColor: '#2ea370',
          borderRadius: '8px',
          border: '2px solid rgba(62, 207, 142, 0.3)',
          boxShadow: '0 15px 40px rgba(62, 207, 142, 0.2)',
        }}
      />
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f1419',
        display: 'flex',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient overlay */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 80% 50%, rgba(62, 207, 142, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Left side - Text content */}
      <div
        style={{
          flex: '0 0 50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: '120px',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: '64px',
            fontWeight: '700',
            color: '#3ECF8E',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '4px',
          }}
        >
          Supabase
        </div>
        <div
          style={{
            fontSize: '120px',
            fontWeight: '800',
            color: '#ffffff',
            lineHeight: '1',
            textShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
            marginBottom: '20px',
          }}
        >
          Storage
        </div>
        <div
          style={{
            fontSize: '72px',
            fontWeight: '600',
            color: '#a0aec0',
          }}
        >
          Explained
        </div>
      </div>

      {/* Right side - Storage visualization */}
      <div
        style={{
          flex: '0 0 50%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Main storage container */}
        <div
          style={{
            position: 'relative',
            width: '600px',
            height: '700px',
          }}
        >
          {/* Folders */}
          <FolderIcon top="100px" left="50px" scale={1.2} />
          <FolderIcon top="280px" left="200px" scale={1} />
          <FolderIcon top="500px" left="80px" scale={0.9} />

          {/* Files scattered around */}
          <FileIcon color="#4a5568" top="50px" left="300px" />
          <FileIcon color="#2d3748" top="200px" left="420px" />
          <FileIcon color="#1a202c" top="380px" left="350px" />
          <FileIcon color="#4a5568" top="560px" left="280px" />
          <FileIcon color="#2d3748" top="140px" left="480px" />

          {/* Floating accent circles */}
          <div
            style={{
              position: 'absolute',
              top: '50px',
              right: '50px',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#3ECF8E',
              opacity: 0.3,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '100px',
              right: '100px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#3ECF8E',
              opacity: 0.4,
            }}
          />
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '8px',
          background: 'linear-gradient(90deg, transparent 0%, #3ECF8E 50%, transparent 100%)',
        }}
      />

      {/* Corner accent */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '60px',
          width: '100px',
          height: '100px',
          border: '3px solid #3ECF8E',
          borderRight: 'none',
          borderBottom: 'none',
          opacity: 0.3,
        }}
      />
    </AbsoluteFill>
  );
};
