/**
 * One WebGL context for the whole page. It lives on a hidden canvas, and each
 * visible element is a plain 2D canvas that has the result copied into it.
 */

export const GLSL_NOISE = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p;
    amplitude *= 0.5;
  }
  return value;
}
`;

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

export type Uniforms = Record<string, number | readonly number[]>;

type Program = {
  program: WebGLProgram;
  locations: Map<string, WebGLUniformLocation | null>;
};

let gl: WebGLRenderingContext | null = null;
let glCanvas: HTMLCanvasElement | null = null;
let unsupported = false;
const programs = new Map<string, Program | null>();
const restoreListeners = new Set<() => void>();

function prepareContext(context: WebGLRenderingContext) {
  programs.clear();
  context.bindBuffer(context.ARRAY_BUFFER, context.createBuffer());
  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    context.STATIC_DRAW,
  );
  context.enableVertexAttribArray(0);
  context.vertexAttribPointer(0, 2, context.FLOAT, false, 0, 0);
}

function getContext() {
  if (gl || unsupported) return gl;

  glCanvas = document.createElement("canvas");
  gl = glCanvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: "low-power",
  });
  if (!gl) {
    unsupported = true;
    return null;
  }

  prepareContext(gl);
  glCanvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
  });
  glCanvas.addEventListener("webglcontextrestored", () => {
    prepareContext(gl!);
    restoreListeners.forEach((listener) => listener());
  });
  return gl;
}

function getProgram(context: WebGLRenderingContext, fragmentShader: string) {
  const cached = programs.get(fragmentShader);
  if (cached !== undefined) return cached;

  let result: Program | null = null;
  const program = context.createProgram();
  const vertex = context.createShader(context.VERTEX_SHADER);
  const fragment = context.createShader(context.FRAGMENT_SHADER);
  if (program && vertex && fragment) {
    context.shaderSource(vertex, VERTEX_SHADER);
    context.compileShader(vertex);
    context.shaderSource(fragment, fragmentShader);
    context.compileShader(fragment);
    context.attachShader(program, vertex);
    context.attachShader(program, fragment);
    context.bindAttribLocation(program, 0, "position");
    context.linkProgram(program);
    context.deleteShader(vertex);
    context.deleteShader(fragment);
    if (context.getProgramParameter(program, context.LINK_STATUS)) {
      result = { program, locations: new Map() };
    }
  }

  programs.set(fragmentShader, result);
  return result;
}

function run(
  context: WebGLRenderingContext,
  fragmentShader: string,
  width: number,
  height: number,
  uniforms: Uniforms,
  texture?: WebGLTexture,
) {
  const entry = getProgram(context, fragmentShader);
  if (!entry) return false;

  context.useProgram(entry.program);
  context.viewport(0, 0, width, height);
  if (texture) context.bindTexture(context.TEXTURE_2D, texture);

  const all: Uniforms = { ...uniforms, resolution: [width, height] };
  for (const name in all) {
    if (!entry.locations.has(name)) {
      entry.locations.set(name, context.getUniformLocation(entry.program, name));
    }
    const location = entry.locations.get(name)!;
    const value = all[name];
    if (typeof value === "number") context.uniform1f(location, value);
    else if (value.length === 2) context.uniform2f(location, value[0], value[1]);
    else context.uniform3f(location, value[0], value[1], value[2]);
  }

  context.drawArrays(context.TRIANGLES, 0, 3);
  return true;
}

/** Runs a shader once and keeps the result, for work too heavy to do per frame. */
export function bakeTexture(
  fragmentShader: string,
  width: number,
  height: number,
  uniforms: Uniforms,
) {
  const context = getContext();
  if (!context || context.isContextLost()) return null;

  const texture = context.createTexture();
  const framebuffer = context.createFramebuffer();
  if (!texture || !framebuffer) return null;

  context.bindTexture(context.TEXTURE_2D, texture);
  context.texImage2D(
    context.TEXTURE_2D,
    0,
    context.RGBA,
    width,
    height,
    0,
    context.RGBA,
    context.UNSIGNED_BYTE,
    null,
  );
  for (const [name, value] of [
    [context.TEXTURE_MIN_FILTER, context.LINEAR],
    [context.TEXTURE_MAG_FILTER, context.LINEAR],
    [context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE],
    [context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE],
  ]) {
    context.texParameteri(context.TEXTURE_2D, name, value);
  }

  context.bindFramebuffer(context.FRAMEBUFFER, framebuffer);
  context.framebufferTexture2D(
    context.FRAMEBUFFER,
    context.COLOR_ATTACHMENT0,
    context.TEXTURE_2D,
    texture,
    0,
  );
  const baked = run(context, fragmentShader, width, height, uniforms);
  context.bindFramebuffer(context.FRAMEBUFFER, null);
  context.deleteFramebuffer(framebuffer);

  if (!baked) {
    context.deleteTexture(texture);
    return null;
  }
  return texture;
}

export function releaseTexture(texture: WebGLTexture) {
  gl?.deleteTexture(texture);
}

/** Draws in the shared context, then copies the result to a visible canvas. */
function paintTo(
  target: CanvasRenderingContext2D,
  fragmentShader: string,
  uniforms: Uniforms,
  texture?: WebGLTexture,
) {
  const context = getContext();
  if (!context || !glCanvas) return false;
  if (context.isContextLost()) return true; // Repainted once it's restored.

  const { width, height } = target.canvas;
  // Only ever grows, as resizing a WebGL canvas reallocates its buffers.
  if (glCanvas.width < width) glCanvas.width = width;
  if (glCanvas.height < height) glCanvas.height = height;

  if (!run(context, fragmentShader, width, height, uniforms, texture)) {
    return false;
  }
  // WebGL's origin is the bottom left, so that's the corner that was drawn to.
  target.drawImage(
    glCanvas,
    0,
    glCanvas.height - height,
    width,
    height,
    0,
    0,
    width,
    height,
  );
  return true;
}

// All surfaces share one animation frame.
const scheduled = new Set<(now: number) => void>();
let frame = 0;

function schedule(callback: (now: number) => void) {
  scheduled.add(callback);
  if (frame) return;
  frame = requestAnimationFrame((now) => {
    frame = 0;
    const callbacks = Array.from(scheduled);
    scheduled.clear();
    callbacks.forEach((run) => run(now));
  });
}

type PointerListener = (x: number, y: number) => void;
const pointerListeners = new Set<PointerListener>();

function handlePointerMove(event: PointerEvent) {
  if (event.pointerType !== "mouse") return;
  pointerListeners.forEach((listener) => listener(event.clientX, event.clientY));
}

/** Tracks the mouse through a single listener, however many subscribers there are. */
export function subscribeToPointer(listener: PointerListener) {
  if (!pointerListeners.size) {
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
  }
  pointerListeners.add(listener);
  return () => {
    pointerListeners.delete(listener);
    if (!pointerListeners.size) {
      window.removeEventListener("pointermove", handlePointerMove);
    }
  };
}

export type SurfaceSize = { width: number; height: number; ratio: number };

export type Surface = {
  /** Asks for `onFrame` to run on the next animation frame. */
  invalidate(): void;
  /** Runs a shader over this surface. Only valid during `onFrame`. */
  paint(fragmentShader: string, uniforms: Uniforms, texture?: WebGLTexture): void;
  isVisible(): boolean;
  dispose(): void;
};

type SurfaceOptions = {
  /** How far outside the viewport to start preparing, so it's ready in time. */
  margin: string;
  minRatio?: number;
  maxRatio?: number;
  /** Returns whether to keep animating. */
  onFrame(now: number, size: SurfaceSize): boolean;
  /** The shared context or a shader isn't usable. */
  onUnavailable(): void;
  /** The canvas changed size, so anything baked at the old size is stale. */
  onResize?(): void;
  /** The context was lost and came back, so all textures are gone. */
  onRestore?(): void;
};

/** A visible canvas drawn by the shared context, set up as it nears the viewport. */
export function mountSurface(
  canvas: HTMLCanvasElement,
  options: SurfaceOptions,
): Surface {
  const { minRatio = 1, maxRatio = 2 } = options;
  let target: CanvasRenderingContext2D | null = null;
  let size: SurfaceSize = { width: 0, height: 0, ratio: 1 };
  let visible = false;
  let idle: number | undefined;

  function fit() {
    const context = getContext();
    const limit = context ? context.getParameter(context.MAX_TEXTURE_SIZE) : 4096;
    const clientWidth = Math.max(1, canvas.clientWidth);
    const clientHeight = Math.max(1, canvas.clientHeight);
    const ratio = Math.min(
      Math.max(Math.min(window.devicePixelRatio, maxRatio), minRatio),
      limit / clientWidth,
    );
    const width = Math.round(clientWidth * ratio);
    const height = Math.round(clientHeight * ratio);
    if (width === size.width && height === size.height) return false;

    size = { width, height, ratio };
    canvas.width = width;
    canvas.height = height;
    // Replaces the old contents outright, keeping the fog's transparency exact.
    if (target) target.globalCompositeOperation = "copy";
    return true;
  }

  function draw(now: number) {
    if (!target) return;
    if (options.onFrame(now, size)) schedule(draw);
  }

  const resizeObserver = new ResizeObserver(() => {
    if (!fit()) return;
    options.onResize?.();
    // Resizing clears a canvas, so repaint now rather than flash blank.
    draw(performance.now());
  });

  function handleRestore() {
    options.onRestore?.();
    schedule(draw);
  }

  function init() {
    target = canvas.getContext("2d");
    if (!target || !getContext()) return options.onUnavailable();

    fit();
    restoreListeners.add(handleRestore);
    resizeObserver.observe(canvas);
    schedule(draw);
  }

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && idle === undefined) {
        idle = window.requestIdleCallback
          ? window.requestIdleCallback(init, { timeout: 500 })
          : window.setTimeout(init, 100);
      }
    },
    { rootMargin: options.margin },
  );
  intersectionObserver.observe(canvas);

  return {
    invalidate() {
      if (target) schedule(draw);
    },
    paint(fragmentShader, uniforms, texture) {
      if (target && !paintTo(target, fragmentShader, uniforms, texture)) {
        options.onUnavailable();
      }
    },
    isVisible: () => visible,
    dispose() {
      if (idle !== undefined) {
        if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
        else window.clearTimeout(idle);
      }
      target = null;
      scheduled.delete(draw);
      restoreListeners.delete(handleRestore);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    },
  };
}

export function hexToRgb(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255].map(
    (channel) => channel / 255,
  ) as [number, number, number];
}
