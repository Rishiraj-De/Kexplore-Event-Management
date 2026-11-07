/**
 * Adapted from the 21st.dev "Login Form" by minhxthanh (smokey WebGL background + glass form).
 * Changes for Summit:
 *  • the shader blends between two palette colours instead of fading to black, and keeps one
 *    WebGL program alive (the original rebuilt it on every mouse move and never stopped its loop);
 *  • the form is a real sign-in / create-account form shaped like an event pass, with validation,
 *    server errors, a password reveal toggle and our Google sign-in.
 */
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { cn, prefersReducedMotion } from '@/lib/utils';

const vertexSmokeySource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`;

const fragmentSmokeySource = `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform vec3 u_color;
uniform vec3 u_base;

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 centeredUV = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);
    float time = iTime * 0.5;

    vec2 mouse = iMouse / iResolution;
    vec2 rippleCenter = 2.0 * mouse - 1.0;

    vec2 distortion = centeredUV;
    for (float i = 1.0; i < 8.0; i++) {
        distortion.x += 0.5 / i * cos(i * 2.0 * distortion.y + time + rippleCenter.x * 3.1415);
        distortion.y += 0.5 / i * cos(i * 2.0 * distortion.x + time + rippleCenter.y * 3.1415);
    }

    float wave = abs(sin(distortion.x + distortion.y + time));
    float glow = smoothstep(0.9, 0.2, wave);

    gl_FragColor = vec4(mix(u_base, u_color, glow * 0.85), 1.0);
}
`;

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

const blurClassMap = {
  none: 'backdrop-blur-none',
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
  '2xl': 'backdrop-blur-2xl',
  '3xl': 'backdrop-blur-3xl',
};

/** Interactive WebGL "smoke" that drifts and bends towards the pointer. */
export function SmokeyBackground({ backdropBlurAmount = 'sm', color = '#feaf76', baseColor = '#152630', className = '' }) {
  const canvasRef = useRef(null);
  const pointer = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', { antialias: false, powerPreference: 'low-power' });
    if (!gl) return undefined; // No WebGL: the base colour behind the canvas still shows.

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vs = compile(gl.VERTEX_SHADER, vertexSmokeySource);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSmokeySource);
    if (!vs || !fs) return undefined;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'iResolution');
    const uTime = gl.getUniformLocation(program, 'iTime');
    const uMouse = gl.getUniformLocation(program, 'iMouse');
    gl.uniform3f(gl.getUniformLocation(program, 'u_color'), ...hexToRgb(color));
    gl.uniform3f(gl.getUniformLocation(program, 'u_base'), ...hexToRgb(baseColor));

    // Render at most 1.5× device pixels; the blur on top hides the difference.
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    const smoothed = { x: 0.5, y: 0.5 };
    const start = performance.now();
    const still = prefersReducedMotion();
    let frame = 0;

    const draw = (now) => {
      const width = Math.max(1, Math.round(canvas.clientWidth * scale));
      const height = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      const target = pointer.current ?? { x: 0.5, y: 0.5 };
      smoothed.x += (target.x - smoothed.x) * 0.05;
      smoothed.y += (target.y - smoothed.y) * 0.05;

      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uTime, still ? 4 : (now - start) / 1000);
      gl.uniform2f(uMouse, smoothed.x * width, (1 - smoothed.y) * height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!still) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
    };
    const onLeave = () => {
      pointer.current = null;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, [color, baseColor]);

  return (
    <div className={cn('absolute inset-0 size-full overflow-hidden', className)} style={{ background: baseColor }} aria-hidden>
      <canvas ref={canvasRef} className="size-full" />
      <div className={cn('absolute inset-0', blurClassMap[backdropBlurAmount] ?? blurClassMap.sm)} />
    </div>
  );
}

/** Underlined input whose label floats up on focus or once filled (from the original component). */
function FloatingField({ icon: Icon, label, error, type = 'text', trailing, inputRef, ...props }) {
  const id = useId();
  return (
    <div>
      <div className="relative z-0">
        <input
          ref={inputRef}
          id={id}
          type={type}
          placeholder=" "
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'peer block w-full appearance-none border-0 border-b-2 bg-transparent px-0 py-2.5 text-[0.95rem] text-white focus:outline-none focus:ring-0',
            trailing && 'pr-9',
            error ? 'border-[#ff9b85] focus:border-[#ff9b85]' : 'border-white/30 focus:border-apricot',
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            'absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-white/65 duration-300',
            'peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75',
            error ? 'peer-focus:text-[#ff9b85]' : 'peer-focus:text-apricot',
          )}
        >
          <Icon className="-mt-1 mr-2 inline-block" size={16} aria-hidden />
          {label}
        </label>
        {trailing && <div className="absolute right-0 top-1.5">{trailing}</div>}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-[#ffb3a3]">
          {error}
        </p>
      )}
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[\p{L}][\p{L} .'-]{1,59}$/u;

function validate(mode, { name, email, password }) {
  const errors = {};
  if (mode === 'signup' && !NAME_RE.test(name.trim())) errors.name = 'Use 2–60 letters (spaces, . \' - allowed)';
  if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address';
  if (mode === 'signup') {
    if (password.length < 8) errors.password = 'Use at least 8 characters';
    else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) errors.password = 'Mix letters and numbers';
  } else if (!password) errors.password = 'Enter your password';
  return errors;
}

/**
 * Glass sign-in / create-account form styled as an event pass.
 * `onSubmit({ mode, name, email, password })` must return a promise; a rejected ApiError's
 * `details` are shown against the matching fields.
 */
export function LoginForm({ onSubmit, googleButton, busy = false, className }) {
  const [mode, setMode] = useState('signin');
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [reveal, setReveal] = useState(false);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const signup = mode === 'signup';

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors(({ [key]: _gone, ...rest }) => rest);
    setFormError('');
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setFormError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(mode, values);
    setErrors(found);
    setFormError('');
    const first = ['name', 'email', 'password'].find((k) => found[k]);
    if (first) {
      ({ name: nameRef, email: emailRef, password: passwordRef })[first].current?.focus();
      return;
    }
    try {
      await onSubmit({ mode, name: values.name.trim(), email: values.email.trim().toLowerCase(), password: values.password });
    } catch (err) {
      if (err?.details) setErrors(err.details);
      setFormError(err?.details ? '' : err?.message || 'Something went wrong — please try again');
    }
  };

  return (
    <div
      className={cn(
        'summit-pass relative w-full max-w-sm rounded-[28px] border border-white/20 bg-white/10 text-white shadow-2xl backdrop-blur-lg',
        className,
      )}
    >
      {/* Pass header */}
      <div className="flex h-[104px] flex-col justify-center px-8">
        <p className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-white/60">
          <span>Summit pass</span>
          <span>Admit one</span>
        </p>
        <h2 className="mt-2 font-display text-[1.75rem] font-bold leading-tight tracking-tight">
          {signup ? 'Get your pass' : 'Welcome back'}
        </h2>
      </div>
      <div className="mx-6 border-t-2 border-dashed border-white/20" aria-hidden />

      <div className="space-y-6 px-8 pb-8 pt-6">
        <div role="tablist" aria-label="Account" className="grid grid-cols-2 rounded-full bg-black/20 p-1 text-sm font-semibold">
          {[
            ['signin', 'Sign in'],
            ['signup', 'Create account'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              onClick={() => switchMode(key)}
              className={cn('rounded-full py-2 transition-colors', mode === key ? 'bg-white text-deep' : 'text-white/70 hover:text-white')}
            >
              {label}
            </button>
          ))}
        </div>

        <form className="space-y-7" onSubmit={submit} noValidate>
          {signup && (
            <FloatingField icon={User} label="Full name" autoComplete="name" value={values.name} onChange={set('name')} error={errors.name} inputRef={nameRef} />
          )}
          <FloatingField
            icon={Mail}
            label="Email address"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={values.email}
            onChange={set('email')}
            error={errors.email}
            inputRef={emailRef}
          />
          <FloatingField
            icon={Lock}
            label="Password"
            type={reveal ? 'text' : 'password'}
            autoComplete={signup ? 'new-password' : 'current-password'}
            value={values.password}
            onChange={set('password')}
            error={errors.password}
            inputRef={passwordRef}
            trailing={
              <button
                type="button"
                onClick={() => setReveal((r) => !r)}
                className="grid size-8 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label={reveal ? 'Hide password' : 'Show password'}
                aria-pressed={reveal}
              >
                {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          />
          {signup && <p className="-mt-4 text-xs text-white/55">At least 8 characters, with letters and numbers.</p>}

          {formError && (
            <p role="alert" className="rounded-xl border border-[#ff9b85]/40 bg-[#ff9b85]/10 px-3 py-2 text-sm text-[#ffd2c7]">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="group flex w-full items-center justify-center rounded-xl bg-apricot px-4 py-3 font-semibold text-deep transition-all duration-300 hover:bg-[#ffc093] focus:outline-none focus:ring-2 focus:ring-apricot focus:ring-offset-2 focus:ring-offset-deep disabled:opacity-60"
          >
            {busy ? 'One moment…' : signup ? 'Create account' : 'Sign in'}
            {!busy && <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />}
          </button>
        </form>

        {googleButton && (
          <>
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-white/20" />
              <span className="mx-4 shrink text-[11px] uppercase tracking-[0.18em] text-white/55">or continue with</span>
              <div className="flex-grow border-t border-white/20" />
            </div>
            {googleButton}
          </>
        )}

        <p className="text-center text-xs text-white/60">
          {signup ? 'Already have an account? ' : 'New to Summit? '}
          <button type="button" onClick={() => switchMode(signup ? 'signin' : 'signup')} className="font-semibold text-apricot hover:text-[#ffc093]">
            {signup ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>
    </div>
  );
}
