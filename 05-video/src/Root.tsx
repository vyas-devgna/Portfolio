import React from 'react';
import { Composition } from 'remotion';
import { Showcase } from './Showcase';
import timeline from './timeline.json';

const total = timeline.scenes[timeline.scenes.length - 1].end * timeline.fps;

export const RemotionRoot: React.FC = () => (
  <Composition id="KTShowcase" component={Showcase} durationInFrames={total} fps={timeline.fps} width={1920} height={1080} />
);
