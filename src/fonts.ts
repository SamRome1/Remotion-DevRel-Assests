import { delayRender, continueRender, staticFile } from 'remotion';

// Circular Std is a licensed font and is NOT committed. Drop CircularStd-Book.otf
// into public/fonts/ locally (gitignored). If it is missing, compositions fall
// back to system-ui without failing the render.
const handle = delayRender('Loading CircularStd font');

const face = new FontFace(
  'CircularStd',
  `url(${staticFile('fonts/CircularStd-Book.otf')}) format('opentype')`,
  { weight: '400', style: 'normal' },
);

face.load().then((loaded) => {
  document.fonts.add(loaded);
  continueRender(handle);
}).catch(() => {
  continueRender(handle);
});

// Only Book (400) weight is available. For 600/700/800 weights the browser
// will synthesise bold — acceptable for video rendering.
export const circularFamily = 'CircularStd, system-ui, -apple-system, sans-serif';
