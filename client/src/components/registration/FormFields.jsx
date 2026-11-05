import { CircleAlert, CircleCheck, Minus, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useId } from 'react';
import { COUNTRIES } from '@/lib/validators';
import { cn } from '@/lib/utils';

export function FieldMessage({ id, error, hint }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {error ? (
        <motion.p
          key="error"
          id={id}
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="mt-2 flex items-start gap-1.5 pl-1 text-sm text-coral"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" /> {error}
        </motion.p>
      ) : hint ? (
        <motion.p key="hint" id={id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 pl-1 text-sm text-muted">
          {hint}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

const shell = (error, valid) =>
  cn(
    'flex h-14 items-center gap-3 rounded-2xl border bg-surface px-4 transition-all duration-200',
    'focus-within:ring-4',
    error ? 'border-coral focus-within:ring-coral/15' : valid ? 'border-emerald-500/50 focus-within:ring-emerald-500/15' : 'border-line focus-within:border-fg/30 focus-within:ring-brand/20',
  );

/** Labelled text input with icon, inline error/hint and a "valid" tick. */
export function TextField({ label, name, icon: Icon, error, valid, hint, optional, inputRef, className, ...props }) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 flex items-center justify-between pl-1 text-sm font-medium">
        {label}
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      <div className={shell(error, valid)}>
        {Icon && <Icon className={cn('size-5 shrink-0', error ? 'text-coral' : 'text-muted')} aria-hidden />}
        <input
          ref={inputRef}
          id={id}
          name={name}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? msgId : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted/70"
          {...props}
        />
        <AnimatePresence>
          {valid && !error && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <CircleCheck className="size-5 text-emerald-500" aria-label="Looks good" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <FieldMessage id={msgId} error={error} hint={hint} />
    </div>
  );
}

/** Phone input with a country-code selector; digits are grouped as the user types. */
export function PhoneField({ value, country, onChange, onCountryChange, onBlur, error, valid, inputRef }) {
  const id = useId();
  const msgId = `${id}-msg`;
  const current = COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0];
  return (
    <div>
      <label htmlFor={id} className="mb-2 block pl-1 text-sm font-medium">
        Phone number
      </label>
      <div className={cn(shell(error, valid), 'pl-1.5')}>
        <div className="relative h-11 shrink-0">
          <select
            aria-label="Country code"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className="h-full appearance-none rounded-xl bg-surface-2 pl-3 pr-8 text-sm font-medium outline-none"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.dial}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted">▼</span>
        </div>
        <input
          ref={inputRef}
          id={id}
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={current.example}
          aria-invalid={Boolean(error)}
          aria-describedby={msgId}
          className="h-full min-w-0 flex-1 bg-transparent font-mono text-base tracking-wide outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-muted/70"
        />
        {valid && !error && <CircleCheck className="size-5 shrink-0 text-emerald-500" aria-label="Looks good" />}
      </div>
      <FieldMessage id={msgId} error={error} hint={`${current.name}: ${current.hint}`} />
    </div>
  );
}

export function TicketStepper({ value, max, onChange, price, error }) {
  const total = (price || 0) * value;
  return (
    <div>
      <p className="mb-2 pl-1 text-sm font-medium">Number of tickets</p>
      <div className={cn('flex items-center justify-between rounded-2xl border bg-surface p-2 pl-4', error ? 'border-coral' : 'border-line')}>
        <div>
          <p className="font-display text-lg font-bold">
            {value} {value === 1 ? 'ticket' : 'tickets'}
          </p>
          <p className="text-xs text-muted">{price ? `Total ₹${total.toLocaleString('en-IN')}` : 'Free entry'} · max {max}</p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Remove a ticket" className="grid size-11 place-items-center rounded-xl bg-surface-2 transition hover:bg-fg hover:text-bg disabled:opacity-40 disabled:hover:bg-surface-2 disabled:hover:text-fg">
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center font-mono text-lg font-semibold tabular-nums" aria-live="polite">
            {value}
          </span>
          <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Add a ticket" className="grid size-11 place-items-center rounded-xl bg-surface-2 transition hover:bg-fg hover:text-bg disabled:opacity-40 disabled:hover:bg-surface-2 disabled:hover:text-fg">
            <Plus className="size-4" />
          </button>
        </div>
      </div>
      <FieldMessage error={error} />
    </div>
  );
}
