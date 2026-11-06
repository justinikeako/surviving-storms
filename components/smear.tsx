"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { GLSL_NOISE, hexToRgb, mountSurface } from "~/lib/webgl";

const PAINT_DURATION = 900;

const TONES = {
  lime: {
    rest: "#4d7c0f",
    hover: "#65a30d",
    active: "#3f6212",
    fallback: "bg-lime-700 group-hover:bg-lime-600 group-active:bg-lime-800",
  },
  gray: {
    rest: "#1f2937",
    hover: "#374151",
    active: "#111827",
    fallback: "bg-gray-800 group-hover:bg-gray-700 group-active:bg-gray-900",
  },
  red: {
    rest: "#dc2626",
    hover: "#ef4444",
    active: "#b91c1c",
    fallback: "bg-red-600 group-hover:bg-red-500 group-active:bg-red-700",
  },
  yellow: {
    rest: "#ca8a04",
    hover: "#eab308",
    active: "#a16207",
    fallback:
      "bg-yellow-600 group-hover:bg-yellow-500 group-active:bg-yellow-700",
  },
};

// A loaded brush dragged left to right: mostly solid paint, with torn edges and
// the odd dry patch, rather than an even fade.
const FRAGMENT_SHADER = `${GLSL_NOISE}
uniform vec2 resolution;
uniform float seed;
uniform float progress;
uniform float wet;
uniform vec3 color;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float u = uv.x;

  // The stroke climbs to the right, and wanders a little as it goes.
  float rise = 0.3 + hash(vec2(seed, 4.0)) * 0.12;
  float v = (uv.y - 0.5) * 2.0 - rise * (u - 0.5);
  v += (noise(vec2(u * 2.2, seed)) - 0.5) * 0.12;
  float across = abs(v);

  // Tapers towards each end, for a lozenge rather than a box.
  float taper = smoothstep(0.0, 0.2, u) * (1.0 - smoothstep(0.82, 1.0, u));

  // A torn outline of short jags, which is crisp except for the odd soft patch.
  float side = v > 0.0 ? 1.0 : 5.0;
  float rough = (noise(vec2(u * 9.0 + seed, side + seed)) - 0.5) * 0.17
    + (noise(vec2(u * 30.0, side * 2.0 + seed)) - 0.5) * 0.11
    + (noise(vec2(u * 92.0, side * 3.0 + seed)) - 0.5) * 0.08;
  float inset = 0.56 + taper * 0.2 + rough - across;
  float feather = mix(0.012, 0.06, smoothstep(0.5, 0.8, noise(vec2(u * 6.0 + seed * 3.0, side))));
  float body = smoothstep(-feather, feather, inset);

  // Each bristle lands and lifts on its own. One gap splits the end into lobes.
  float start = 0.05 + noise(vec2(v * 7.0, seed + 3.0)) * 0.05
    + noise(vec2(v * 26.0, seed + 4.0)) * 0.035 + across * across * 0.07;
  float gap = -0.3 + hash(vec2(seed, 9.0)) * 0.6;
  float end = 0.9 + noise(vec2(v * 6.0, seed + 7.0)) * 0.05
    + noise(vec2(v * 24.0, seed + 8.0)) * 0.035 - across * across * 0.09
    - 0.05 * (1.0 - smoothstep(0.0, 0.1, abs(v - gap)));
  float head = end * progress;
  float lift = mix(0.004, 0.016, noise(vec2(v * 5.0, seed + 11.0)));
  float paint = smoothstep(start - lift, start + lift, u)
    * (1.0 - smoothstep(head - lift, head + lift * 0.5, u));

  // The label sits here, so the paint has to stay solid behind it.
  float label = (1.0 - smoothstep(0.3, 0.4, abs(u - 0.5)))
    * (1.0 - smoothstep(0.42, 0.62, abs(uv.y - 0.5) * 2.0));

  // Small tears in from the outline and the ends, angled slightly off the stroke.
  float near = max(
    1.0 - smoothstep(0.0, 0.13, inset),
    max(1.0 - smoothstep(0.0, 0.05, u - start), 1.0 - smoothstep(0.0, 0.06, end - u))
  );
  float threshold = mix(1.3, 0.74, near) + wet * 0.08;
  float fray = noise(vec2(u * 24.0 + v * 3.0 + seed * 2.0, v * 36.0))
    + noise(vec2(u * 52.0 - seed, v * 70.0)) * 0.25;
  float gaps = smoothstep(threshold - 0.05, threshold + 0.05, fray) * (1.0 - label);

  // The odd dry wipe, where the brush skipped and left thin paint behind.
  float wipe = noise(vec2(u * 3.4 + seed * 7.0, v * 6.5 + seed))
    + (noise(vec2(u * 26.0, v * 30.0)) - 0.5) * 0.08;
  float thin = smoothstep(0.74, 0.79, wipe - wet * 0.08) * (1.0 - label);
  float streaky = 0.5 + noise(vec2(u * 10.0, v * 36.0 + seed)) * 0.35;

  // The barest unevenness in the pigment, so that it doesn't read as a flat fill.
  float pigment = 0.93 + 0.07 * smoothstep(0.3, 0.6, noise(vec2(u * 3.0 + seed * 5.0, v * 14.0)));
  pigment *= 1.0 - near * 0.1;
  pigment = max(mix(pigment, 1.0, wet * 0.5), label);

  float alpha = body * paint * (1.0 - gaps) * mix(1.0, streaky, thin) * pigment;

  // A faint dusting just outside the paint.
  float dust = smoothstep(0.58, 0.72, noise(vec2(u * 9.0 + seed, v * 26.0)))
    * smoothstep(-0.09, -0.015, inset)
    * smoothstep(start - 0.02, start, u) * (1.0 - smoothstep(head, head + 0.02, u));
  alpha = max(alpha, dust * 0.3);

  gl_FragColor = vec4(color * alpha, alpha);
}`;

type SmearProps = {
  tone: keyof typeof TONES;
  seed: number;
  /** Seconds to wait after coming into view, before painting. */
  delay?: number;
};

/** A brush stroke that paints itself behind the link that contains it. */
export function Smear({ tone, seed, delay = 0 }: SmearProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const colors = TONES[tone];

  useEffect(() => {
    const canvas = canvasRef.current;
    const link = canvas?.closest("a");
    if (!canvas || !link) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let lastTime = 0;

    // Painting is requested when in view, which may be before the shader's ready.
    let paintRequested = false;
    let paintStart: number | null = null;

    let progress = 0;
    let wet = 0;
    let color = hexToRgb(colors.rest);
    let hovered = false;
    let focused = false;
    let pressed = false;

    function targets() {
      const lively = hovered || focused;
      return {
        wet: pressed ? 1 : lively ? 0.7 : 0,
        color: hexToRgb(
          pressed ? colors.active : lively ? colors.hover : colors.rest,
        ),
      };
    }

    // Only runs while something is changing, so a settled stroke costs nothing.
    const surface = mountSurface(canvas, {
      margin: "400px",
      // Oversampled, as the fine bristle detail looks jagged at a low pixel ratio.
      minRatio: 2,
      maxRatio: 3,
      onFrame(now) {
        const delta = lastTime ? Math.min(now - lastTime, 50) : 16;
        lastTime = now;
        const target = targets();
        const blend = reducedMotion || pressed ? 1 : 1 - Math.exp(-delta / 80);

        let moving = false;
        if (progress < 1 && paintRequested) {
          if (reducedMotion) {
            progress = 1;
          } else {
            paintStart ??= now + delay * 1000;
            const t = Math.max(0, (now - paintStart) / PAINT_DURATION);
            // Ease out, as a brush slows when it's lifted.
            progress = t >= 1 ? 1 : 1 - Math.pow(1 - t, 2.4);
            moving = progress < 1;
          }
        }

        wet += (target.wet - wet) * blend;
        color = color.map(
          (channel, i) => channel + (target.color[i] - channel) * blend,
        ) as typeof color;
        if (Math.abs(target.wet - wet) > 0.002) moving = true;
        if (color.some((c, i) => Math.abs(target.color[i] - c) > 0.002)) {
          moving = true;
        }

        surface.paint(FRAGMENT_SHADER, { seed, progress, wet, color });
        if (!moving) lastTime = 0;
        return moving;
      },
      onUnavailable() {
        setFailed(true);
      },
    });

    const schedule = () => surface.invalidate();

    function handleEnter(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      hovered = true;
      schedule();
    }
    function handleLeave() {
      hovered = false;
      pressed = false;
      schedule();
    }
    function handleDown() {
      pressed = true;
      schedule();
    }
    function handleUp() {
      pressed = false;
      schedule();
    }
    function handleFocus() {
      focused = link!.matches(":focus-visible");
      schedule();
    }
    function handleBlur() {
      focused = false;
      schedule();
    }

    link.addEventListener("pointerenter", handleEnter);
    link.addEventListener("pointerleave", handleLeave);
    link.addEventListener("pointercancel", handleLeave);
    link.addEventListener("pointerdown", handleDown);
    link.addEventListener("pointerup", handleUp);
    link.addEventListener("focus", handleFocus);
    link.addEventListener("blur", handleBlur);

    const paintObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        paintObserver.disconnect();
        paintRequested = true;
        schedule();
      },
      { threshold: 0.5 },
    );
    paintObserver.observe(canvas);

    return () => {
      surface.dispose();
      paintObserver.disconnect();
      link.removeEventListener("pointerenter", handleEnter);
      link.removeEventListener("pointerleave", handleLeave);
      link.removeEventListener("pointercancel", handleLeave);
      link.removeEventListener("pointerdown", handleDown);
      link.removeEventListener("pointerup", handleUp);
      link.removeEventListener("focus", handleFocus);
      link.removeEventListener("blur", handleBlur);
    };
  }, [colors, seed, delay]);

  if (failed) {
    return (
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 transition-colors mask-contain mask-luminance mask-center mask-no-repeat mask-[url(/brush-mask.webp)] group-active:transition-none",
          colors.fallback,
        )}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 block h-full w-full"
    />
  );
}
