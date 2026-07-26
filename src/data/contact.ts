/**
 * The band's contact channels.
 *
 * Everything here is null until the band supplies it. The site renders only the
 * channels that are set, and the booking form stays disabled with a plain
 * explanation rather than shipping a link that goes nowhere. Filling any one of
 * `whatsapp` or `email` in is enough to make booking live.
 */
export const contact = {
  /** Digits only, international format, no plus or spaces. Example: '2348012345678'. */
  whatsapp: null as string | null,
  /** Display form; also used for the tel: link. Example: '+234 801 234 5678'. */
  phone: null as string | null,
  email: null as string | null,
  /** Handle without the @. Example: 'lagosmusicalband'. */
  instagram: null as string | null,
};

/** True once at least one channel can actually receive a booking enquiry. */
export const canReceiveBookings = Boolean(contact.whatsapp || contact.email);

export type Enquiry = {
  name: string;
  contact: string;
  date: string;
  venue: string;
  formation: string;
  notes: string;
};

function enquiryLines(enquiry: Enquiry): string[] {
  const lines = [
    `Booking enquiry from ${enquiry.name}`,
    `Date: ${enquiry.date}`,
    `Venue: ${enquiry.venue}`,
    `Formation: ${enquiry.formation}`,
    `Reach me on: ${enquiry.contact}`,
  ];
  if (enquiry.notes.trim()) lines.push(`Notes: ${enquiry.notes.trim()}`);
  return lines;
}

/**
 * Builds the handoff link for a completed enquiry. WhatsApp first, since that is
 * how bookings reach the band today; email as the fallback. Null when neither
 * channel is configured, which is what disables the submit button.
 */
export function bookingHref(enquiry: Enquiry): string | null {
  const lines = enquiryLines(enquiry);

  if (contact.whatsapp) {
    return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  if (contact.email) {
    const subject = `Booking enquiry, ${enquiry.date}, ${enquiry.formation}`;
    return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      lines.join('\n'),
    )}`;
  }

  return null;
}

/** Direct WhatsApp link with no enquiry attached, for the nav sheet and footer. */
export function whatsappHref(): string | null {
  return contact.whatsapp ? `https://wa.me/${contact.whatsapp}` : null;
}
