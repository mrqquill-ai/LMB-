import { useId, useRef, useState, type FormEvent } from 'react';
import { allPackages } from '../data/packages';
import { bookingHref, canReceiveBookings, type Enquiry } from '../data/contact';

type Field = keyof Omit<Enquiry, 'notes'>;

const REQUIRED: Field[] = ['name', 'contact', 'date', 'venue', 'formation'];

const EMPTY: Enquiry = { name: '', contact: '', date: '', venue: '', formation: '', notes: '' };

const FORMATIONS = [...allPackages.map((pkg) => pkg.name), 'Not sure yet'];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns an error message for a field, or null when it is valid. */
function validate(field: Field, value: string): string | null {
  const trimmed = value.trim();

  switch (field) {
    case 'name':
      return trimmed ? null : 'Enter the name we should reply to.';
    case 'contact':
      if (!trimmed) return 'Enter a phone number or email address so we can reply.';
      if (trimmed.includes('@')) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
          ? null
          : 'That email address is missing something. Check it and try again.';
      }
      return (trimmed.match(/\d/g) ?? []).length >= 7
        ? null
        : 'That phone number looks too short. Include the full number.';
    case 'date':
      if (!trimmed) return 'Pick the date of the event.';
      return trimmed >= today() ? null : 'Pick a date that has not passed yet.';
    case 'venue':
      return trimmed ? null : 'Tell us the venue, or the area of Lagos.';
    case 'formation':
      return trimmed ? null : 'Choose a formation, or pick Not sure yet.';
  }
}

export function BookingForm() {
  const [values, setValues] = useState<Enquiry>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();

  const fieldId = (field: string) => `${id}-${field}`;
  const errorId = (field: string) => `${id}-${field}-error`;
  const helpId = (field: string) => `${id}-${field}-help`;

  const set = (field: keyof Enquiry) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    // Clear an existing error as soon as the field becomes valid again, but
    // never introduce one mid-keystroke. New errors arrive on blur or submit.
    if (field !== 'notes' && errors[field] && !validate(field, value)) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const blur = (field: Field) => () => {
    setErrors((current) => ({ ...current, [field]: validate(field, values[field]) ?? undefined }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const found: Partial<Record<Field, string>> = {};
    for (const field of REQUIRED) {
      const message = validate(field, values[field]);
      if (message) found[field] = message;
    }
    setErrors(found);

    const firstInvalid = REQUIRED.find((field) => found[field]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(fieldId(firstInvalid))}`)?.focus();
      return;
    }

    const href = bookingHref(values);
    if (!href) return;

    window.open(href, '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  if (sent) {
    return (
      <div className="lmb-form-panel lmb-form-done" role="status">
        <h3 className="lmb-h3">Enquiry ready to send.</h3>
        <p className="lmb-form-done-copy">
          Your enquiry opened in a new tab with the date, venue and formation filled in. Send it and
          the band replies with availability and a quote.
        </p>
        <button
          type="button"
          className="lmb-link-underline lmb-link-on-dark-strong lmb-form-restart"
          onClick={() => {
            setValues(EMPTY);
            setErrors({});
            setSent(false);
          }}
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form className="lmb-form-panel" ref={formRef} onSubmit={submit} noValidate>
      <div className="lmb-field">
        <label className="lmb-label" htmlFor={fieldId('name')}>
          Your name
        </label>
        <input
          className={`lmb-input${errors.name ? ' lmb-input-invalid' : ''}`}
          id={fieldId('name')}
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(event) => set('name')(event.target.value)}
          onBlur={blur('name')}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? errorId('name') : undefined}
        />
        {errors.name && (
          <p className="lmb-error" id={errorId('name')} role="alert">
            <span className="lmb-error-mark" aria-hidden="true" />
            {errors.name}
          </p>
        )}
      </div>

      <div className="lmb-field">
        <label className="lmb-label" htmlFor={fieldId('contact')}>
          Phone or email
        </label>
        <input
          className={`lmb-input${errors.contact ? ' lmb-input-invalid' : ''}`}
          id={fieldId('contact')}
          name="contact"
          type="text"
          inputMode="text"
          autoComplete="tel"
          value={values.contact}
          onChange={(event) => set('contact')(event.target.value)}
          onBlur={blur('contact')}
          aria-invalid={Boolean(errors.contact)}
          aria-describedby={errors.contact ? errorId('contact') : helpId('contact')}
        />
        {errors.contact ? (
          <p className="lmb-error" id={errorId('contact')} role="alert">
            <span className="lmb-error-mark" aria-hidden="true" />
            {errors.contact}
          </p>
        ) : (
          <p className="lmb-help" id={helpId('contact')}>
            Whichever you check most often.
          </p>
        )}
      </div>

      <div className="lmb-field-row">
        <div className="lmb-field">
          <label className="lmb-label" htmlFor={fieldId('date')}>
            Event date
          </label>
          <input
            className={`lmb-input${errors.date ? ' lmb-input-invalid' : ''}`}
            id={fieldId('date')}
            name="date"
            type="date"
            min={today()}
            value={values.date}
            onChange={(event) => set('date')(event.target.value)}
            onBlur={blur('date')}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? errorId('date') : undefined}
          />
          {errors.date && (
            <p className="lmb-error" id={errorId('date')} role="alert">
              <span className="lmb-error-mark" aria-hidden="true" />
              {errors.date}
            </p>
          )}
        </div>

        <div className="lmb-field">
          <label className="lmb-label" htmlFor={fieldId('venue')}>
            Venue or area
          </label>
          <input
            className={`lmb-input${errors.venue ? ' lmb-input-invalid' : ''}`}
            id={fieldId('venue')}
            name="venue"
            type="text"
            value={values.venue}
            onChange={(event) => set('venue')(event.target.value)}
            onBlur={blur('venue')}
            aria-invalid={Boolean(errors.venue)}
            aria-describedby={errors.venue ? errorId('venue') : undefined}
          />
          {errors.venue && (
            <p className="lmb-error" id={errorId('venue')} role="alert">
              <span className="lmb-error-mark" aria-hidden="true" />
              {errors.venue}
            </p>
          )}
        </div>
      </div>

      <div className="lmb-field">
        <label className="lmb-label" htmlFor={fieldId('formation')}>
          Formation
        </label>
        <div className="lmb-select-wrap">
          <select
            className={`lmb-input lmb-select${errors.formation ? ' lmb-input-invalid' : ''}`}
            id={fieldId('formation')}
            name="formation"
            value={values.formation}
            onChange={(event) => set('formation')(event.target.value)}
            onBlur={blur('formation')}
            aria-invalid={Boolean(errors.formation)}
            aria-describedby={errors.formation ? errorId('formation') : undefined}
          >
            <option value="">Choose a formation</option>
            {FORMATIONS.map((formation) => (
              <option key={formation} value={formation}>
                {formation}
              </option>
            ))}
          </select>
        </div>
        {errors.formation && (
          <p className="lmb-error" id={errorId('formation')} role="alert">
            <span className="lmb-error-mark" aria-hidden="true" />
            {errors.formation}
          </p>
        )}
      </div>

      <div className="lmb-field">
        <label className="lmb-label" htmlFor={fieldId('notes')}>
          Anything else <span className="lmb-label-optional">Optional</span>
        </label>
        <textarea
          className="lmb-input lmb-textarea"
          id={fieldId('notes')}
          name="notes"
          rows={3}
          value={values.notes}
          onChange={(event) => set('notes')(event.target.value)}
        />
      </div>

      <div className="lmb-form-actions">
        <button type="submit" className="lmb-cta-solid lmb-submit" disabled={!canReceiveBookings}>
          Send booking enquiry
        </button>
        <p className="lmb-help lmb-form-note">
          {canReceiveBookings
            ? 'Opens in WhatsApp with your details filled in. A 50% deposit holds the date.'
            : 'The booking line is not connected yet. Call the band directly in the meantime.'}
        </p>
      </div>
    </form>
  );
}
