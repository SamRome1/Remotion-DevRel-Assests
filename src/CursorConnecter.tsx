import { Lottie, LottieAnimationData } from '@remotion/lottie';
import { useEffect, useState } from 'react';
import { AbsoluteFill, cancelRender, continueRender, delayRender, staticFile } from 'remotion';

// Register Montserrat Bold under the exact name lottie-web looks for,
// so no JSON patching is needed and font-weight/style are handled correctly.
const FONT_URL = 'https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2';

export const CursorConnecter: React.FC = () => {
  const [fontHandle] = useState(() => delayRender('Loading font'));
  const [dataHandle] = useState(() => delayRender('Loading Lottie animation'));
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);

  useEffect(() => {
    const face = new FontFace('CircularStd-Bold', `url(${FONT_URL}) format('woff2')`, {
      weight: '700',
      style: 'normal',
    });
    face
      .load()
      .then((loaded) => {
        document.fonts.add(loaded);
        continueRender(fontHandle);
      })
      .catch((err) => {
        cancelRender(err);
        console.log('Font failed to load', err);
      });
  }, [fontHandle]);

  useEffect(() => {
    fetch(staticFile('CursorConnecter_08.json'))
      .then((res) => res.json())
      .then((json) => {
        setAnimationData(json);
        continueRender(dataHandle);
      })
      .catch((err) => {
        cancelRender(err);
        console.log('Animation failed to load', err);
      });
  }, [dataHandle]);

  if (!animationData) {
    return null;
  }

  return (
    <AbsoluteFill>
      <Lottie
        animationData={animationData}
        style={{ width: '100%', height: '100%' }}
      />
    </AbsoluteFill>
  );
};
