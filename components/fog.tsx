"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import {
  GLSL_NOISE,
  type Target,
  contextLost,
  createTarget,
  hexToRgb,
  mountSurface,
  releaseTarget,
  renderToTarget,
  subscribeToPointer,
} from "~/lib/webgl";

const WIPE_RADIUS = 72;
/** How long a wipe takes to settle back, in milliseconds. */
const RECOVERY = 1100;
/** The trail is soft, so it's kept at half the CSS resolution. */
const TRAIL_SCALE = 0.5;
/**
 * How far the mouse must travel for the wipe to build most of the way up, in
 * CSS pixels. Building up gradually, instead of appearing at full strength,
 * keeps a fresh movement after a pause from popping in.
 */
const BUILD_DISTANCE = 55;
/** Points of the mouse's path that can be added to the trail in one frame. */
const PATH_POINTS = 8;

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
      result = max(result, fan * smoothstep(0.5, 0.74, lines));
    }
  }
  return result;
}

// Round drops scattered over a jittered grid, at most one to a cell, each its
// own size. The size is that of a cell, and chance is how many hold a drop.
float drops(vec2 p, float size, float chance, float salt) {
  vec2 q = p / size;
  vec2 cell = floor(q);
  float result = 0.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 c = cell + vec2(float(i), float(j));
      if (hash(c + salt) > chance) continue;

      vec2 centre = c + 0.2 + 0.6 * vec2(hash(c + salt + 1.0), hash(c + salt + 2.0));
      float radius = 0.14 + 0.32 * hash(c + salt + 3.0);

      // Stretched in a random direction, with a lumpy outline, so no two drops
      // match. Neighbours that overlap merge into one irregular shape.
      float a = hash(c + salt + 4.0) * 6.283;
      vec2 offset = mat2(cos(a), -sin(a), sin(a), cos(a)) * (q - centre);
      offset.x /= 1.0 + hash(c + salt + 5.0) * 0.9;
      float lumps = (noise(q * 2.6 + c * 1.7 + salt) - 0.5) * 0.75
        + (noise(q * 7.0 + salt) - 0.5) * 0.3;
      float d = length(offset) / radius + lumps;

      float softness = 0.3 + 0.45 * hash(c + salt + 6.0);
      float strength = 0.5 + 0.5 * hash(c + salt + 7.0);
      result = max(result, strength * (1.0 - smoothstep(1.0 - softness, 1.0, d)));
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

  // Beads of water and small dry spots, heavier in some areas than others.
  float patchiness = smoothstep(0.3, 0.7, fbm(p * 1.6 + 9.0));
  float beads = max(
    drops(p, 0.07, 0.42 * patchiness, 3.0),
    drops(p + 7.3, 0.035, 0.3 * patchiness, 9.0) * 0.7
  );
  density = mix(density, 1.0, beads * 0.7 * smoothstep(-0.1, 0.3, density));
  float pits = drops(p + 40.0, 0.05, 0.2 * (1.0 - patchiness), 17.0);
  density *= 1.0 - pits * 0.2;

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

// Where the mouse has wiped the fog. Each frame fades what's there a little,
// then adds to it along the path the mouse took since the last frame, so the
// trail follows the hand exactly, builds up as it moves and recovers oldest
// first. Kept in the red channel.
const TRAIL_SHADER = `${GLSL_NOISE}
uniform vec2 resolution;
uniform sampler2D previous;
uniform float scale;
uniform float decay;
uniform vec2 path[${PATH_POINTS}];
uniform float count;
uniform float gain;

float toSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  return length(pa - ba * clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0));
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 p = gl_FragCoord.xy / scale;

  // Taking a fixed amount off as well means faint values can't round back up to
  // themselves in an 8-bit texture and linger forever.
  float wipe = max(texture2D(previous, uv).r * decay - 1.5 / 255.0, 0.0);

  if (count > 0.5) {
    float d = length(p - path[0]);
    for (int i = 1; i < ${PATH_POINTS}; i++) {
      if (float(i) >= count) break;
      d = min(d, toSegment(p, path[i - 1], path[i]));
    }
    // An irregular edge, as a sleeve or a leaf wouldn't clear a clean shape.
    d += (noise(p * 0.034) - 0.5) * 48.0 + (noise(p * 0.15) - 0.5) * 12.0;
    float stamp = 1.0 - smoothstep(${(WIPE_RADIUS * 0.3).toFixed(1)}, ${WIPE_RADIUS.toFixed(1)}, d);
    wipe += (1.0 - wipe) * stamp * gain;
  }

  gl_FragColor = vec4(wipe, 0.0, 0.0, 1.0);
}`;

// Far cheaper than the surface itself, so it can run on every frame: this only
// samples the baked surface, thinning it wherever the trail is.
const WIPE_SHADER = `${GLSL_NOISE}
uniform vec2 resolution;
uniform sampler2D surface;
uniform sampler2D trail;
uniform vec2 trailTexel;
uniform float pixelRatio;
uniform float anchored;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float wipe = texture2D(trail, uv).r;

  vec2 texel = trailTexel * 2.0;
  vec2 slope = vec2(
    texture2D(trail, uv + vec2(texel.x, 0.0)).r - texture2D(trail, uv - vec2(texel.x, 0.0)).r,
    texture2D(trail, uv + vec2(0.0, texel.y)).r - texture2D(trail, uv - vec2(0.0, texel.y)).r
  );

  // The surface is dragged slightly outward from the path, and collects in a
  // ridge along the edge of the trail.
  vec4 fog = texture2D(surface, uv + slope * 56.0 * pixelRatio / resolution);
  float ridge = clamp(length(slope) * 6.0, 0.0, 1.0) * (1.0 - wipe);

  // Banks stay solid at the bottom, where they meet the next section.
  float amount = mix(1.0, smoothstep(0.1, 0.3, uv.y), anchored);
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

    let surfaceTarget: Target | null = null;
    // Two, as a shader can't read from the texture it's drawing into.
    let trails: [Target, Target] | null = null;
    let disabled = false;

    // The mouse's path since the last frame, in CSS pixels from the canvas's
    // bottom left. It starts at the previous frame's last point, for continuity.
    type Point = { x: number; y: number };
    let path: Point[] = [];
    let last: Point | null = null;
    let moved = false;
    let lastMove = -Infinity;
    let lastTime = 0;

    function discardTargets() {
      if (surfaceTarget) releaseTarget(surfaceTarget);
      trails?.forEach(releaseTarget);
      surfaceTarget = null;
      trails = null;
    }

    function fail() {
      // Losing the context is temporary. Anything else means the fog can't work.
      if (!contextLost()) disabled = true;
      return false;
    }

    function pathUniform() {
      // Keeps the first and last points, and as many evenly spaced between.
      const points =
        path.length <= PATH_POINTS
          ? path
          : Array.from(
              { length: PATH_POINTS },
              (_, i) =>
                path[Math.round((i * (path.length - 1)) / (PATH_POINTS - 1))],
            );
      const values = new Float32Array(PATH_POINTS * 2);
      points.forEach((point, i) => values.set([point.x, point.y], i * 2));

      let distance = 0;
      for (let i = 1; i < path.length; i++) {
        distance += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
      }
      return {
        path: values,
        count: moved ? points.length : 0,
        gain: 1 - Math.exp(-distance / BUILD_DISTANCE),
      };
    }

    const surface = mountSurface(canvas, {
      margin: "200px",
      // The fine detail is drawn once, so it can afford full resolution on phones.
      maxRatio: 3,
      onFrame(now, { width, height, ratio }) {
        if (disabled) return false;

        if (!surfaceTarget) {
          surfaceTarget = createTarget(width, height);
          if (!surfaceTarget) return fail();
          const baked = renderToTarget(surfaceTarget, SURFACE_SHADER, {
            pixelRatio: ratio,
            color: hexToRgb(color),
            seed,
            clearing: +clearing,
            protectCopy: +protectCopy,
            veil: +veil,
          });
          if (!baked) return fail();
        }

        if (!trails) {
          const trailWidth = Math.max(1, Math.round((width / ratio) * TRAIL_SCALE));
          const trailHeight = Math.max(1, Math.round((height / ratio) * TRAIL_SCALE));
          const a = createTarget(trailWidth, trailHeight);
          const b = createTarget(trailWidth, trailHeight);
          if (!a || !b) return fail();
          trails = [a, b];
        }

        const delta = lastTime ? Math.min(now - lastTime, 50) : 16;
        lastTime = now;

        const [previous, next] = trails;
        const updated = renderToTarget(
          next,
          TRAIL_SHADER,
          { scale: TRAIL_SCALE, decay: Math.exp(-delta / RECOVERY), ...pathUniform() },
          { previous: previous.texture },
        );
        if (!updated) return fail();
        trails = [next, previous];
        path = last ? [last] : [];
        moved = false;

        surface.paint(
          WIPE_SHADER,
          {
            pixelRatio: ratio,
            anchored: veil ? 0 : 1,
            trailTexel: [1 / next.width, 1 / next.height],
          },
          { surface: surfaceTarget.texture, trail: next.texture },
        );
        setReady(true);

        // By then the trail has faded to nothing.
        const active = now - lastMove < RECOVERY * 4;
        if (!active) lastTime = 0;
        return active;
      },
      onUnavailable() {
        // The canvas just stays hidden, as the fog is only decoration.
        disabled = true;
      },
      onResize: discardTargets,
      onRestore() {
        surfaceTarget = null;
        trails = null;
      },
    });

    const unsubscribe = reducedMotion
      ? undefined
      : subscribeToPointer((x, y) => {
          if (disabled || !surface.isVisible()) return;
          const rect = canvas.getBoundingClientRect();
          const point = { x: x - rect.left, y: rect.bottom - y };
          const inside =
            point.x > -WIPE_RADIUS &&
            point.x < rect.width + WIPE_RADIUS &&
            point.y > -WIPE_RADIUS &&
            point.y < rect.height + WIPE_RADIUS;

          if (!inside) {
            // Coming back in starts a new path, instead of joining up with this one.
            last = null;
            return;
          }
          if (!last) path = [];
          path.push(point);
          last = point;
          moved = true;
          lastMove = performance.now();
          surface.invalidate();
        });

    return () => {
      unsubscribe?.();
      surface.dispose();
      discardTargets();
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
