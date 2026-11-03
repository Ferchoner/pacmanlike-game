import Phaser from 'phaser';
import { SceneKeys } from '../core/SceneKeys';
import { registerAnimations } from '../presentation/AnimationManager';
import { queueAssets } from '../presentation/AssetLoader';
import { ART_SCALE, ASSET_REPORT } from '../presentation/assets/gameAssets';
import { addTempLabel } from '../presentation/tempLabel';

/**
 * Preload: carga todos los recursos (imágenes, spritesheets, audio) antes de
 * jugar. Las rutas salen de `docs/03_recursos/manifest.json` (solo entradas
 * con `status: "approved"`). Lo que falte o falle se queda en TEMP: el juego
 * siempre arranca, y la consola dice qué falta.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Preload);
  }

  preload(): void {
    const { width, height } = this.scale;
    addTempLabel(this, height / 2 - 30, 'Cargando… (TEMP)');

    // TEMP: barra de progreso con formas simples (placeholder técnico).
    const barWidth = width / 2;
    const bar = this.add.graphics();
    this.load.on('progress', (value: number) => {
      bar.clear();
      bar.fillStyle(0xffffff, 1);
      bar.fillRect((width - barWidth) / 2, height / 2, barWidth * value, 8);
    });

    queueAssets(this.load, ASSET_REPORT.ready);
  }

  create(): void {
    registerAnimations(this, ASSET_REPORT.ready, ART_SCALE);
    reportAssets();
    this.scene.start(SceneKeys.Menu);
  }
}

/** Informe en consola: errores del manifest y recursos que siguen en TEMP. */
function reportAssets(): void {
  const { ready, missing, errors } = ASSET_REPORT;
  for (const e of errors) console.error(`[manifest] ${e.id}: ${e.message}`);
  const p0 = missing.filter((m) => m.priority === 'P0');
  const temporary = ready.filter((r) => r.temporary).map((r) => r.id);
  console.info(
    `[recursos] ${ready.length} cargables · ${missing.length} pendientes (${p0.length} P0) · lo pendiente usa TEMP`,
  );
  if (temporary.length > 0) {
    console.warn(`[recursos] USO TEMPORAL (válido para la beta, no para la versión final): ${temporary.join(', ')}`);
  }
  if (missing.length > 0) console.table(missing);
}
