/**
 * Puts a round chrome ball head on the mace.
 *
 * The generated mace came with a European crown and eagle finial. A real
 * marching mace of this kind carries a plain rounded ball, so the finial was
 * cut off at the cord binding and this renders a replacement in the same
 * material as the shaft.
 *
 * The ball is drawn rather than photographed because the Higgsfield balance is
 * spent. Polished metal is mostly specular, so it models well: a vertical
 * environment gradient with a dark horizon band, one key highlight, a weaker
 * fill from the right, a fresnel rim, and a warm bounce off the gold cord
 * below. Colours are sampled from the shaft so the two read as one object.
 *
 * This is a one-off that has already been applied to assets-src/cutouts/mace.png.
 * Re-running it would stack a second head on top of the first.
 *
 *   node scripts/mace-head.mjs
 */
import sharp from 'sharp';

const SRC = 'assets-src/cutouts/mace.png';

/** Ball size, in the asset's own pixels. Roughly three shaft diameters. */
const BALL_W = 112;
const BALL_H = 100;
/** How far the ball sinks into the cord binding, so it reads as seated. */
const OVERLAP = 12;
/** Centre of the shaft, measured across a clean cross-section. */
const SHAFT_CX = 72.5;

/**
 * What the ball reflects, bottom to top. Satin rather than mirror: the real
 * mace in the reference is tarnished and soft-shaded, and a hard horizon band
 * reads as a 3D render rather than as a photographed object. The warm tone at
 * the base is bounce off the gold cord underneath it.
 */
const ENVIRONMENT = [
  [0.0, [182, 158, 110]],
  [0.2, [166, 163, 154]],
  [0.42, [96, 98, 106]],
  [0.54, [132, 135, 144]],
  [0.72, [196, 199, 206]],
  [1.0, [231, 233, 239]],
];

function environment(t) {
  for (let i = 1; i < ENVIRONMENT.length; i++) {
    const [t1, c1] = ENVIRONMENT[i];
    if (t <= t1) {
      const [t0, c0] = ENVIRONMENT[i - 1];
      const k = (t - t0) / (t1 - t0);
      return c0.map((c, j) => c + (c1[j] - c) * k);
    }
  }
  return ENVIRONMENT[ENVIRONMENT.length - 1][1];
}

const normalise = (v) => {
  const l = Math.hypot(...v);
  return v.map((c) => c / l);
};
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const KEY = normalise([-0.5, 0.72, 0.48]);
const FILL = normalise([0.62, 0.3, 0.55]);
const VIEW = [0, 0, 1];

/** Renders the ball as a raw RGBA buffer. */
function renderBall() {
  const out = Buffer.alloc(BALL_W * BALL_H * 4);
  const rx = BALL_W / 2;
  const ry = BALL_H / 2;

  for (let y = 0; y < BALL_H; y++) {
    for (let x = 0; x < BALL_W; x++) {
      const u = (x + 0.5 - rx) / rx;
      // Screen y grows downward; flip so +v is up, as the lighting expects.
      const v = -(y + 0.5 - ry) / ry;
      const r2 = u * u + v * v;
      const i = (y * BALL_W + x) * 4;

      if (r2 >= 1) continue;

      const n = [u, v, Math.sqrt(1 - r2)];
      let colour = environment((n[1] + 1) / 2);

      const spec = (light, power, strength) => {
        const half = normalise([light[0] + VIEW[0], light[1] + VIEW[1], light[2] + VIEW[2]]);
        return Math.pow(Math.max(0, dot(n, half)), power) * strength;
      };
      const highlight = spec(KEY, 34, 130) + spec(FILL, 16, 46);
      // Grazing angles brighten, which keeps the silhouette from going flat.
      const rim = Math.pow(1 - n[2], 4) * 44;

      // Contact shading where the ball meets the cord binding, so it sits on
      // the shaft instead of floating in front of it.
      const seat = v < -0.55 ? Math.pow((-v - 0.55) / 0.45, 1.6) * 0.55 : 0;

      colour = colour.map((c) => Math.min(255, (c + highlight + rim) * (1 - seat)));

      // One pixel of coverage falloff at the silhouette.
      const edge = Math.min(1, (1 - Math.sqrt(r2)) * rx);

      out[i] = Math.round(colour[0]);
      out[i + 1] = Math.round(colour[1]);
      out[i + 2] = Math.round(colour[2]);
      out[i + 3] = Math.round(255 * edge);
    }
  }
  return out;
}

const { width, height } = await sharp(SRC).metadata();
const ballTop = 0;
const shift = BALL_H - OVERLAP;

const ball = await sharp(renderBall(), { raw: { width: BALL_W, height: BALL_H, channels: 4 } })
  .png()
  .toBuffer();

await sharp({
  create: { width, height: height + shift, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([
    { input: await sharp(SRC).toBuffer(), left: 0, top: shift },
    { input: ball, left: Math.round(SHAFT_CX - BALL_W / 2), top: ballTop },
  ])
  .png()
  .trim({ threshold: 0 })
  .toFile('/tmp/mace-headed.png');

await sharp('/tmp/mace-headed.png').toFile(SRC);
const after = await sharp(SRC).metadata();
console.log(`mace ${width}x${height} -> ${after.width}x${after.height} with a ${BALL_W}x${BALL_H} ball head`);
