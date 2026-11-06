"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import {
  GLSL_NOISE,
  bakeTexture,
  hexToRgb,
  mountSurface,
  releaseTexture,
  subscribeToPointer,
} from "~/lib/webgl";

const WIPE_RADIUS = 72;
/** How long a wipe takes to settle back, in milliseconds. */
const RECOVERY = 1100;

// Condensation on a surface, and the marks a storm leaves in it. Positions are
// in units of 100 CSS pixels, so marks keep their size on any screen.
const SURFACE_SHADER = `${GLSL_NOISE}
uniform vec2 resolution;
uniform float pixelRatio;
uniform float seed;
uniform float clearing;
uniform float protectCopy;
uniform float veil;
uniform vec3 color;

// Fans of fine parallel lines, where something dragged across the surface.
float sweeps(vec2 p) {
  const float size = 3.2;
  vec2 cell = floor(p / size);
  float result = 0.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 c = cell + vec2(float(i), float(j));
      if (hash(c + 31.0) > 0.6) continue;

      vec2 offset = p - (c + vec2(hash(c + 1.0), hash(c + 2.0))) * size;
      float radius = length(offset);
      float angle = atan(offset.y, offset.x) - hash(c + 3.0) * 6.283;
      angle = atan(sin(angle), cos(angle));

      float spread = 0.3 + hash(c + 4.0) * 0.5;
      float reach = 1.1 + hash(c + 5.0) * 1.7;
      float fan = 1.0 - smoothstep(spread * 0.5, spread, abs(angle));
      fan *= smoothstep(0.25, 0.8, radius) * (1.0 - smoothstep(reach * 0.45, reach, radius));

      float lines = noise(vec2(
        angle * (40.0 + hash(c + 6.0) * 50.0),
        radius * 0.7 + hash(c + 7.0) * 50.0
      ));
      result = max(result, fan * smoothstep(0.52, 0.68, lines));
    }
  }
  return result;
}

// Small hard-edged shapes, tapered and curled like leaf fragments or nicks.
float flecks(vec2 p) {
  const float size = 0.9;
  vec2 cell = floor(p / size);
  float result = 0.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 c = cell + vec2(float(i), float(j));
      // Gate on low-frequency noise so that the debris gathers in clusters.
      float cluster = smoothstep(0.45, 0.75, noise(c * 0.3 + 11.0));
      if (hash(c + 8.0) > 0.3 * cluster) continue;

      float a = hash(c + 9.0) * 6.283;
      vec2 q = mat2(cos(a), -sin(a), sin(a), cos(a))
        * (p - (c + vec2(hash(c + 10.0), hash(c + 11.0))) * size);

      float h = hash(c + 12.0);
      float len = 0.1 + h * h * 0.5;
      q.y += (hash(c + 13.0) - 0.5) * 2.4 * q.x * q.x / len;
      q.y += (noise(p * 16.0) - 0.5) * 0.025;

      float t = q.x / len;
      if (abs(t) > 1.0) continue;

      // Some are broad leaf shapes, others are hairline scratches.
      float breadth = hash(c + 14.0) > 0.45 ? 0.1 + hash(c + 15.0) * 0.28 : 0.025;
      float width = len * breadth * (1.0 - t * t);
      float strength = 0.55 + hash(c + 16.0) * 0.45;
      result = max(result, strength * (1.0 - smoothstep(width, width + 0.012, abs(q.y))));
    }
  }
  return result;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 p = gl_FragCoord.xy / pixelRatio / 100.0 + seed * vec2(17.3, 9.1);

  // Where the condensation has settled, with soft blotches where it hasn't.
  vec2 warp = vec2(fbm(p * 0.45), fbm(p * 0.45 + vec2(5.2, 1.3)));
  float density = smoothstep(0.24, 0.6, fbm(p * 0.55 + warp * 1.4));
  density *= 0.72 + 0.55 * fbm(p * 3.0 + warp);

  // Fine beads of water and tiny dry pits, heavier in some areas than others.
  float patchiness = fbm(p * 1.6 + 9.0);
  float beads = smoothstep(0.7, 0.82, noise(p * 62.0) + (patchiness - 0.5) * 0.35);
  density = mix(density, 1.0, beads * 0.75 * smoothstep(-0.1, 0.3, density));
  float pits = smoothstep(0.76, 0.86, noise(p * 38.0 + 40.0) + (0.5 - patchiness) * 0.3);
  density *= 1.0 - pits * 0.22;

  // Sweeps invert what's beneath them, so they show on both thick and thin fog.
  density = mix(density, 1.0 - density * 0.85, sweeps(p) * 0.7);
  density *= 1.0 - flecks(p);
  density = clamp(density, 0.0, 1.0);

  float alpha = density;
  if (veil < 0.5) {
    // Dissolve into the section below, keeping the centre of the image clear.
    float y = uv.y;
    float radial = smoothstep(0.0, 1.0, length((uv - vec2(0.5, 1.0)) * vec2(2.0, 1.0)));
    alpha *= (1.0 - smoothstep(0.0, 1.0, y)) * mix(1.0, radial, clearing);

    // The hero copy sits on the left (or full width on narrow screens), starting
    // halfway up. Thin the fog there so the text keeps its contrast.
    float aspect = resolution.x / resolution.y;
    float copy = protectCopy * (1.0 - min(smoothstep(0.35, 0.65, uv.x), smoothstep(1.8, 2.4, aspect)));
    alpha *= mix(1.0, mix(1.0, 0.55, smoothstep(0.3, 0.5, y)), copy);

    // Solid at the very bottom, so it meets the next section without a seam.
    alpha = max(alpha, 1.0 - smoothstep(0.0, 0.16, y));
  }

  gl_FragColor = vec4(color * alpha, alpha);
}`;

// Far cheaper than the surface itself, so it can run on every frame: this only
// samples the baked surface and wipes a path through it. The path is a capsule
// between two points following the mouse at different speeds, so it stretches
// along the direction of travel and closes up when the mouse stops.
const WIPE_SHADER = `${GLSL_NOISE}
uniform vec2 resolution;
uniform sampler2D surface;
uniform float pixelRatio;
uniform vec2 head;
uniform vec2 tail;
uniform float strength;
uniform float anchored;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 p = gl_FragCoord.xy / pixelRatio;

  vec2 fromTail = p - tail;
  vec2 path = head - tail;
  vec2 offset = fromTail - path * clamp(dot(fromTail, path) / max(dot(path, path), 1.0), 0.0, 1.0);

  // An irregular edge, as a sleeve or a leaf wouldn't clear a clean shape.
  float d = length(offset)
    + (noise(p * 0.034) - 0.5) * 48.0
    + (noise(p * 0.15) - 0.5) * 12.0;

  float wipe = 1.0 - smoothstep(${(WIPE_RADIUS * 0.3).toFixed(1)}, ${WIPE_RADIUS.toFixed(1)}, d);
  float ridge = smoothstep(${(WIPE_RADIUS * 0.8).toFixed(1)}, ${WIPE_RADIUS.toFixed(1)}, d)
    * (1.0 - smoothstep(${WIPE_RADIUS.toFixed(1)}, ${(WIPE_RADIUS * 1.4).toFixed(1)}, d));

  // The surface is dragged slightly outward, and collects in a ridge at the edge.
  vec2 direction = offset / max(length(offset), 1.0);
  vec4 fog = texture2D(surface, uv - direction * wipe * strength * 9.0 * pixelRatio / resolution);

  // Banks stay solid at the bottom, where they meet the next section.
  float amount = strength * mix(1.0, smoothstep(0.1, 0.3, uv.y), anchored);
  float alpha = min(fog.a * (1.0 - wipe * amount * 0.62 + ridge * amount * 0.14), 1.0);
  gl_FragColor = vec4(fog.rgb * (alpha / max(fog.a, 0.001)), alpha);
}`;

type FogProps = {
  /** Must match the background of the section the fog dissolves into. */
  color: `#${string}`;
  className?: string;
  /** Gives each use its own pattern of marks. */
  seed?: number;
  /** Keep the centre of the area clear, with the fog gathering at the sides. */
  clearing?: boolean;
  /** Thin the fog behind the hero copy. */
  protectCopy?: boolean;
  /** Cover the whole area evenly instead of dissolving towards the top. */
  veil?: boolean;
};

export function Fog({
  color,
  className,
  seed = 0,
  clearing = false,
  protectCopy = false,
  veil = false,
}: FogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let texture: WebGLTexture | null = null;
    let disabled = false;

    // The wipe's two points, in CSS pixels from the canvas's bottom left.
    let pointer = { x: 0, y: 0 };
    let head = { x: 0, y: 0 };
    let tail = { x: 0, y: 0 };
    let energy = 0;
    let strength = 0;
    let lastTime = 0;

    function discardTexture() {
      if (texture) releaseTexture(texture);
      texture = null;
    }

    const surface = mountSurface(canvas, {
      margin: "200px",
      onFrame(now, { width, height, ratio }) {
        if (disabled) return false;

        texture ??= bakeTexture(SURFACE_SHADER, width, height, {
          pixelRatio: ratio,
          color: hexToRgb(color),
          seed,
          clearing: +clearing,
          protectCopy: +protectCopy,
          veil: +veil,
        });
        if (!texture) {
          disabled = true;
          return false;
        }

        const delta = lastTime ? Math.min(now - lastTime, 50) : 16;
        lastTime = now;
        const follow = (rate: number) => 1 - Math.exp(-delta / rate);
        head.x += (pointer.x - head.x) * follow(50);
        head.y += (pointer.y - head.y) * follow(50);
        tail.x += (pointer.x - tail.x) * follow(280);
        tail.y += (pointer.y - tail.y) * follow(280);
        energy *= Math.exp(-delta / RECOVERY);
        strength += (energy - strength) * follow(110);

        surface.paint(
          WIPE_SHADER,
          {
            pixelRatio: ratio,
            head: [head.x, head.y],
            tail: [tail.x, tail.y],
            strength,
            anchored: veil ? 0 : 1,
          },
          texture,
        );
        setReady(true);

        const moving = energy > 0.015 || strength > 0.015;
        if (!moving) lastTime = 0;
        return moving;
      },
      onUnavailable() {
        // The canvas just stays hidden, as the fog is only decoration.
        disabled = true;
      },
      onResize: discardTexture,
      onRestore() {
        texture = null;
      },
    });

    const unsubscribe = reducedMotion
      ? undefined
      : subscribeToPointer((x, y) => {
          if (disabled || !surface.isVisible()) return;
          const rect = canvas.getBoundingClientRect();
          const next = { x: x - rect.left, y: rect.bottom - y };
          const inside =
            next.x > -WIPE_RADIUS &&
            next.x < rect.width + WIPE_RADIUS &&
            next.y > -WIPE_RADIUS &&
            next.y < rect.height + WIPE_RADIUS;

          if (inside) {
            // Starting fresh, so don't streak in from where the mouse last left.
            if (energy < 0.02) {
              head = { ...next };
              tail = { ...next };
            }
            const moved = Math.hypot(next.x - pointer.x, next.y - pointer.y);
            energy = Math.min(1, energy + Math.min(moved, 80) / 220);
            surface.invalidate();
          }
          pointer = next;
        });

    return () => {
      unsubscribe?.();
      surface.dispose();
      discardTexture();
    };
  }, [color, seed, clearing, protectCopy, veil]);

  return (
    <div aria-hidden className={cn("pointer-events-none", className)}>
      <canvas
        ref={canvasRef}
        className={cn(
          "block h-full w-full opacity-0 transition-opacity duration-1000",
          ready && "opacity-100",
        )}
      />
    </div>
  );
}
