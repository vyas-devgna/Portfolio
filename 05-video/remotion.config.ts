import { Config } from '@remotion/cli/config';

// Best-quality defaults: lossless PNG frames, near-lossless H.264, slowest (most efficient) encoder preset.
Config.setVideoImageFormat('png');
Config.setCodec('h264');
Config.setCrf(10);
Config.setX264Preset('veryslow');
Config.setPixelFormat('yuv420p');
Config.setChromiumOpenGlRenderer('swangle');
