import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

// Error popup component with zoom effect
const ErrorPopup: React.FC<{
  message: string;
  line: number;
  startFrame: number;
  frame: number;
}> = ({ message, line, startFrame, frame }) => {
  const localFrame = frame - startFrame;

  // Only show if we've reached this error's start frame
  if (localFrame < 0) return null;

  // Opacity fade in
  const opacity = interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  // Zoom effect: starts small, overshoots, then settles
  const scale = interpolate(
    localFrame,
    [0, 5, 10, 15],
    [0.5, 1.2, 0.95, 1.0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: `${line * 24 + 140}px`,
        transform: `translateX(-50%) scale(${scale})`,
        backgroundColor: '#3c1f1f',
        border: '1px solid #f14c4c',
        borderRadius: '4px',
        padding: '12px 16px',
        color: '#f14c4c',
        fontSize: '13px',
        fontFamily: 'Menlo, Monaco, monospace',
        maxWidth: '700px',
        opacity,
        boxShadow: '0 4px 12px rgba(241, 76, 76, 0.3)',
        zIndex: 1000,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>❌</span>
        {message}
      </div>
    </div>
  );
};

// Line number component
const LineNumbers: React.FC<{ count: number }> = ({ count }) => (
  <div
    style={{
      padding: '20px 20px',
      backgroundColor: '#1e1e1e',
      color: '#858585',
      fontSize: '14px',
      fontFamily: 'Menlo, Monaco, monospace',
      lineHeight: '24px',
      textAlign: 'right',
      userSelect: 'none',
      borderRight: '1px solid #2d2d30',
      minWidth: '60px',
    }}
  >
    {Array.from({ length: count }, (_, i) => (
      <div key={i}>{i + 1}</div>
    ))}
  </div>
);

// Code line component
const CodeLine: React.FC<{ children: React.ReactNode; hasError?: boolean }> = ({
  children,
  hasError,
}) => (
  <div
    style={{
      lineHeight: '24px',
      position: 'relative',
      backgroundColor: hasError ? 'rgba(241, 76, 76, 0.1)' : 'transparent',
      paddingLeft: '12px',
    }}
  >
    {hasError && (
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: '#f14c4c',
        }}
      />
    )}
    {children}
  </div>
);

// Error squiggle component
const ErrorSquiggle: React.FC<{ left: number; width: number; top: number }> = ({ left, width, top }) => (
  <div
    style={{
      position: 'absolute',
      left: `${left}ch`,
      top: `${top}px`,
      width: `${width}ch`,
      height: '2px',
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #f14c4c 2px, #f14c4c 4px)',
      backgroundSize: '4px 2px',
      pointerEvents: 'none',
    }}
  />
);

export const CodeEditorChaos: React.FC = () => {
  const frame = useCurrentFrame();

  // Error count animation - increases as errors appear
  const totalErrors = Math.min(Math.floor(frame / 30), 8);

  // Define all errors with their timing and scroll positions
  const errors = [
    {
      startFrame: 30,
      line: 10,
      scrollTo: 0,
      message: "Missing email confirmation redirect URL. Users won't be able to verify accounts!",
    },
    {
      startFrame: 60,
      line: 16,
      scrollTo: -50,
      message: "No error handling - this will return null on auth failures instead of proper error.",
    },
    {
      startFrame: 90,
      line: 30,
      scrollTo: -300,
      message: "Webhook signature might be null - add null check before using!",
    },
    {
      startFrame: 120,
      line: 36,
      scrollTo: -450,
      message: "Webhook not wrapped in try-catch. This will crash your entire API on invalid signatures!",
    },
    {
      startFrame: 150,
      line: 53,
      scrollTo: -850,
      message: "Missing payment_behavior setting. Subscription will fail if customer has no payment method!",
    },
    {
      startFrame: 180,
      line: 60,
      scrollTo: -1050,
      message: "Not checking subscription status - payment might have failed but you're returning success!",
    },
    {
      startFrame: 210,
      line: 67,
      scrollTo: -1200,
      message: "No validation for price ID - users could pass invalid or malicious price IDs!",
    },
    {
      startFrame: 240,
      line: 73,
      scrollTo: -1350,
      message: "Customer ID not validated - potential security vulnerability if user controls this value!",
    },
  ];

  // Calculate scroll position based on current frame
  let scrollY = 0;
  for (let i = 0; i < errors.length; i++) {
    const error = errors[i];
    const nextError = errors[i + 1];

    if (frame >= error.startFrame) {
      if (nextError && frame < nextError.startFrame) {
        // Interpolate between current and next scroll position
        const progress = (frame - error.startFrame) / (nextError.startFrame - error.startFrame);
        const easeProgress = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2; // ease in-out
        scrollY = interpolate(
          easeProgress,
          [0, 1],
          [error.scrollTo, nextError.scrollTo],
          { extrapolateRight: 'clamp' }
        );
      } else if (!nextError) {
        scrollY = error.scrollTo;
      }
    }
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1e1e1e',
        fontFamily: 'Menlo, Monaco, monospace',
      }}
    >
      {/* Top bar with single file tab */}
      <div
        style={{
          height: '48px',
          backgroundColor: '#2d2d30',
          borderBottom: '1px solid #1e1e1e',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
            fontSize: '14px',
            fontFamily: 'Menlo, Monaco, monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            position: 'relative',
          }}
        >
          setup.ts
          {totalErrors > 0 && (
            <span
              style={{
                backgroundColor: '#f14c4c',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '11px',
                fontWeight: 'bold',
              }}
            >
              {totalErrors}
            </span>
          )}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              backgroundColor: '#3ECF8E',
            }}
          />
        </div>
      </div>

      {/* Main editor area */}
      <div style={{ display: 'flex', height: 'calc(100% - 96px)', position: 'relative', overflow: 'hidden' }}>
        {/* Line numbers */}
        <div style={{ transform: `translateY(${scrollY}px)`, transition: 'transform 0.1s ease-out' }}>
          <LineNumbers count={80} />
        </div>

        {/* Code content */}
        <div
          style={{
            flex: 1,
            padding: '20px 0',
            color: '#d4d4d4',
            fontSize: '14px',
            fontFamily: 'Menlo, Monaco, monospace',
            lineHeight: '24px',
            position: 'relative',
            transform: `translateY(${scrollY}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* Code content */}
          <CodeLine><span style={{ color: '#569cd6' }}>import</span> <span style={{ color: '#9cdcfe' }}>{'{ supabase }'}</span> <span style={{ color: '#569cd6' }}>from</span> <span style={{ color: '#ce9178' }}>'./supabase'</span></CodeLine>
          <CodeLine><span style={{ color: '#569cd6' }}>import</span> <span style={{ color: '#9cdcfe' }}>{'{ stripe }'}</span> <span style={{ color: '#569cd6' }}>from</span> <span style={{ color: '#ce9178' }}>'./stripe'</span></CodeLine>
          <CodeLine><span style={{ color: '#569cd6' }}>import</span> <span style={{ color: '#9cdcfe' }}>{'{ NextRequest }'}</span> <span style={{ color: '#569cd6' }}>from</span> <span style={{ color: '#ce9178' }}>'next/server'</span></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine><span style={{ color: '#6a9955' }}>// ============================================</span></CodeLine>
          <CodeLine><span style={{ color: '#6a9955' }}>// Auth Setup</span></CodeLine>
          <CodeLine><span style={{ color: '#6a9955' }}>// ============================================</span></CodeLine>
          <CodeLine hasError><span style={{ color: '#569cd6' }}>export</span> <span style={{ color: '#569cd6' }}>async</span> <span style={{ color: '#569cd6' }}>function</span> <span style={{ color: '#dcdcaa' }}>signUp</span>(<span style={{ color: '#9cdcfe' }}>email</span>: <span style={{ color: '#4ec9b0' }}>string</span>, <span style={{ color: '#9cdcfe' }}>password</span>: <span style={{ color: '#4ec9b0' }}>string</span>) {'{'}</CodeLine>
          <ErrorSquiggle left={2} width={48} top={10 * 24 + 4} />
          <CodeLine>  <span style={{ color: '#569cd6' }}>const</span> {'{ '}<span style={{ color: '#9cdcfe' }}>data</span>, <span style={{ color: '#9cdcfe' }}>error</span> {'} = '}<span style={{ color: '#569cd6' }}>await</span> <span style={{ color: '#9cdcfe' }}>supabase</span>.<span style={{ color: '#dcdcaa' }}>auth</span>.<span style={{ color: '#dcdcaa' }}>signUp</span>({'({'}</CodeLine>
          <CodeLine>    <span style={{ color: '#9cdcfe' }}>email</span>,</CodeLine>
          <CodeLine>    <span style={{ color: '#9cdcfe' }}>password</span>,</CodeLine>
          <CodeLine>  {'})'}</CodeLine>
          <CodeLine></CodeLine>
          <CodeLine hasError>  <span style={{ color: '#c586c0' }}>if</span> (<span style={{ color: '#9cdcfe' }}>error</span>) <span style={{ color: '#c586c0' }}>return</span> <span style={{ color: '#569cd6' }}>null</span></CodeLine>
          <ErrorSquiggle left={19} width={4} top={16 * 24 + 4} />
          <CodeLine>  <span style={{ color: '#c586c0' }}>return</span> <span style={{ color: '#9cdcfe' }}>data</span></CodeLine>
          <CodeLine>{'}'}</CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine><span style={{ color: '#6a9955' }}>// ============================================</span></CodeLine>
          <CodeLine><span style={{ color: '#6a9955' }}>// Webhook Handler</span></CodeLine>
          <CodeLine><span style={{ color: '#6a9955' }}>// ============================================</span></CodeLine>
          <CodeLine><span style={{ color: '#569cd6' }}>export</span> <span style={{ color: '#569cd6' }}>async</span> <span style={{ color: '#569cd6' }}>function</span> <span style={{ color: '#dcdcaa' }}>POST</span>(<span style={{ color: '#9cdcfe' }}>req</span>: <span style={{ color: '#4ec9b0' }}>NextRequest</span>) {'{'}</CodeLine>
          <CodeLine>  <span style={{ color: '#569cd6' }}>const</span> <span style={{ color: '#9cdcfe' }}>body</span> = <span style={{ color: '#569cd6' }}>await</span> <span style={{ color: '#9cdcfe' }}>req</span>.<span style={{ color: '#dcdcaa' }}>text</span>()</CodeLine>
          <CodeLine hasError>  <span style={{ color: '#569cd6' }}>const</span> <span style={{ color: '#9cdcfe' }}>sig</span> = <span style={{ color: '#9cdcfe' }}>req</span>.<span style={{ color: '#9cdcfe' }}>headers</span>.<span style={{ color: '#dcdcaa' }}>get</span>(<span style={{ color: '#ce9178' }}>'stripe-signature'</span>)</CodeLine>
          <ErrorSquiggle left={2} width={9} top={30 * 24 + 4} />
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine>  <span style={{ color: '#6a9955' }}>// Verify webhook signature</span></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine hasError>  <span style={{ color: '#569cd6' }}>const</span> <span style={{ color: '#9cdcfe' }}>event</span> = <span style={{ color: '#9cdcfe' }}>stripe</span>.<span style={{ color: '#9cdcfe' }}>webhooks</span>.<span style={{ color: '#dcdcaa' }}>constructEvent</span>(</CodeLine>
          <CodeLine>    <span style={{ color: '#9cdcfe' }}>body</span>,</CodeLine>
          <CodeLine hasError>    <span style={{ color: '#9cdcfe' }}>sig</span>,</CodeLine>
          <ErrorSquiggle left={4} width={3} top={36 * 24 + 4} />
          <CodeLine>    <span style={{ color: '#9cdcfe' }}>process</span>.<span style={{ color: '#9cdcfe' }}>env</span>.<span style={{ color: '#9cdcfe' }}>STRIPE_WEBHOOK_SECRET</span></CodeLine>
          <CodeLine>  )</CodeLine>
          <CodeLine></CodeLine>
          <CodeLine>  <span style={{ color: '#c586c0' }}>return</span> <span style={{ color: '#569cd6' }}>new</span> <span style={{ color: '#4ec9b0' }}>Response</span>(<span style={{ color: '#ce9178' }}>'OK'</span>)</CodeLine>
          <CodeLine>{'}'}</CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine><span style={{ color: '#6a9955' }}>// ============================================</span></CodeLine>
          <CodeLine><span style={{ color: '#6a9955' }}>// Subscription Setup</span></CodeLine>
          <CodeLine><span style={{ color: '#6a9955' }}>// ============================================</span></CodeLine>
          <CodeLine><span style={{ color: '#569cd6' }}>export</span> <span style={{ color: '#569cd6' }}>async</span> <span style={{ color: '#569cd6' }}>function</span> <span style={{ color: '#dcdcaa' }}>createSubscription</span>(</CodeLine>
          <CodeLine hasError>  <span style={{ color: '#9cdcfe' }}>customerId</span>: <span style={{ color: '#4ec9b0' }}>string</span>,</CodeLine>
          <CodeLine hasError>  <span style={{ color: '#9cdcfe' }}>priceId</span>: <span style={{ color: '#4ec9b0' }}>string</span></CodeLine>
          <CodeLine>) {'{'}</CodeLine>
          <CodeLine></CodeLine>
          <CodeLine hasError>  <span style={{ color: '#569cd6' }}>const</span> <span style={{ color: '#9cdcfe' }}>subscription</span> = <span style={{ color: '#569cd6' }}>await</span> <span style={{ color: '#9cdcfe' }}>stripe</span>.<span style={{ color: '#9cdcfe' }}>subscriptions</span>.<span style={{ color: '#dcdcaa' }}>create</span>({'({'}</CodeLine>
          <ErrorSquiggle left={2} width={48} top={53 * 24 + 4} />
          <CodeLine>    <span style={{ color: '#9cdcfe' }}>customer</span>: <span style={{ color: '#9cdcfe' }}>customerId</span>,</CodeLine>
          <CodeLine>    <span style={{ color: '#9cdcfe' }}>items</span>: [{'{'} <span style={{ color: '#9cdcfe' }}>price</span>: <span style={{ color: '#9cdcfe' }}>priceId</span> {'}'}],</CodeLine>
          <CodeLine>  {'})'}</CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine hasError>  <span style={{ color: '#c586c0' }}>return</span> <span style={{ color: '#9cdcfe' }}>subscription</span></CodeLine>
          <ErrorSquiggle left={9} width={12} top={60 * 24 + 4} />
          <CodeLine>{'}'}</CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine hasError><span style={{ color: '#6a9955' }}>// TODO: Add proper error handling</span></CodeLine>
          <ErrorSquiggle left={0} width={35} top={67 * 24 + 4} />
          <CodeLine hasError><span style={{ color: '#6a9955' }}>// TODO: Validate inputs</span></CodeLine>
          <ErrorSquiggle left={0} width={25} top={68 * 24 + 4} />
          <CodeLine hasError><span style={{ color: '#6a9955' }}>// TODO: Add payment method checks</span></CodeLine>
          <ErrorSquiggle left={0} width={37} top={69 * 24 + 4} />
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>
          <CodeLine hasError><span style={{ color: '#6a9955' }}>// Missing user ID validation!</span></CodeLine>
          <ErrorSquiggle left={0} width={32} top={73 * 24 + 4} />
          <CodeLine></CodeLine>
          <CodeLine></CodeLine>

          {/* All error popups */}
          {errors.map((error, index) => (
            <ErrorPopup
              key={index}
              message={error.message}
              line={error.line}
              startFrame={error.startFrame}
              frame={frame}
            />
          ))}
        </div>
      </div>

      {/* Bottom status bar */}
      <div
        style={{
          height: '48px',
          backgroundColor: '#007acc',
          borderTop: '1px solid #1e1e1e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          color: '#ffffff',
          fontSize: '13px',
        }}
      >
        <div style={{ display: 'flex', gap: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>❌</span>
            <span>{totalErrors} Errors</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <span>{Math.floor(totalErrors * 0.75)} Warnings</span>
          </div>
        </div>
        <div>
          <span style={{ opacity: 0.7 }}>TypeScript • Ln 6, Col 15</span>
        </div>
      </div>

      {/* Flashing error indicator */}
      {totalErrors > 0 && frame % 20 < 10 && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '20px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#f14c4c',
            boxShadow: '0 0 10px #f14c4c',
          }}
        />
      )}
    </AbsoluteFill>
  );
};
