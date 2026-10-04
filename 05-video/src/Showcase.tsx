import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { useSiteFonts } from './components/Fonts';
import { RibbonWipe } from './components/Wipe';
import timeline from './timeline.json';
import { Intro } from './scenes/Intro';
import { Before } from './scenes/Before';
import { Reveal } from './scenes/Reveal';
import { Services } from './scenes/Services';
import { Design } from './scenes/Design';
import { Themes } from './scenes/Themes';
import { Mobile } from './scenes/Mobile';
import { Enquiry } from './scenes/Enquiry';
import { Quality } from './scenes/Quality';
import { Outro } from './scenes/Outro';

const SCENES: Record<string, React.FC<{ dur: number }>> = { intro: Intro, before: Before, reveal: Reveal, services: Services, design: Design, themes: Themes, mobile: Mobile, enquiry: Enquiry, quality: Quality, outro: Outro };

export const Showcase: React.FC = () => {
  useSiteFonts();
  const fps = timeline.fps;
  return (
    <AbsoluteFill style={{ background: '#061015' }}>
      {timeline.scenes.map((s) => {
        const Scene = SCENES[s.id];
        const from = s.start * fps, dur = (s.end - s.start) * fps;
        return <Sequence key={s.id} from={from} durationInFrames={dur} name={s.id}><Scene dur={dur} /></Sequence>;
      })}
      {timeline.scenes.slice(1, -1).map((s) => (
        <Sequence key={'w' + s.id} from={s.start * fps - 10} durationInFrames={20} name={'wipe-' + s.id}><RibbonWipe /></Sequence>
      ))}
      <Audio src={staticFile('music.wav')} volume={(f) => Math.min(1, f / 30) * 0.9} />
    </AbsoluteFill>
  );
};
