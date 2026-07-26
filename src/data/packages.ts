export type Package = {
  name: string;
  price: string;
  instruments: string;
  note: string;
  featured?: boolean;
  terms?: string[];
};

/** The three packages shown on the Home page, ahead of the full Services list. */
export const previewPackages: Package[] = [
  {
    name: 'Full Formation',
    price: '1,000,000',
    instruments: 'Drums and horns',
    note: 'The grand display. Suited to parades, matriculations and large outdoor events.',
    featured: true,
  },
  {
    name: 'Half Formation',
    price: '800,000',
    instruments: 'Drums and horns',
    note: 'Medium setup that still carries a street, indoors or out.',
  },
  {
    name: 'Choir + Band',
    price: '1,500,000',
    instruments: 'Band formation and choir',
    note: 'Both arms together, sound equipment provided. NGN 1,200,000 without.',
  },
];

/** All five formations, with their booking terms, shown on the Services page. */
export const allPackages: Package[] = [
  {
    name: 'Full Formation',
    price: '1,000,000',
    instruments: 'Drums and horns',
    note: 'The grand display. Suited to parades, matriculations and large outdoor events.',
    featured: true,
    terms: [
      'Transport and logistics within Lagos included',
      'Outside Lagos attracts travel and accommodation',
      'Price varies by duration and event type',
    ],
  },
  {
    name: 'Half Formation',
    price: '800,000',
    instruments: 'Drums and horns',
    note: 'Medium setup that still carries a street, indoors or out.',
    terms: ['Transport and logistics within Lagos included', 'Extra cost outside Lagos'],
  },
  {
    name: '2 Per Line Formation',
    price: '600,000',
    instruments: 'Six drums and horns',
    note: 'Compact setup for smaller spaces or a short appearance.',
    terms: ['Transport and logistics within Lagos included', 'No performance outside Lagos'],
  },
  {
    name: 'Choir Only',
    price: '700,000',
    instruments: 'Choir, instruments, sound equipment',
    note: 'Live and acoustic, or with instrumental backing.',
    terms: ['NGN 500,000 without sound equipment', 'No performance outside Lagos'],
  },
  {
    name: 'Choir + Band',
    price: '1,500,000',
    instruments: 'Band formation and choir',
    note: 'Both arms together, the full ceremony.',
    terms: ['Sound equipment provided', 'NGN 1,200,000 without sound equipment'],
  },
];
