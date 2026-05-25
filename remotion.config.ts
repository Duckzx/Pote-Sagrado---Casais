/**
 * remotion.config.ts
 * Configuração do Remotion para o comercial Pote Sagrado
 *
 * Docs: https://remotion.dev/docs/config
 */

import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);

Config.setCodec('h264');
Config.setCrf(18); // qualidade alta (menor = melhor)

Config.setPixelFormat('yuv420p'); // compatibilidade máxima

Config.setNumberOfGifLoops(0);

// Concorrência para render mais rápido
Config.setConcurrency(4);

// Entry point
Config.setEntryPoint('./src/remotion/index.tsx');
