// Grupos confirmados — Sorteo oficial FIFA, Kennedy Center, 5 dic 2025
// Horarios en hora Argentina (UTC-3)
// flag: código ISO 3166-1 alpha-2 para flag-icons (fi fi-{code})
const GROUPS = {
  A: {
    color: '#E53E3E',
    teams: [
      { name: 'México',        flag: 'mx', isArgentina: false },
      { name: 'Corea del Sur', flag: 'kr', isArgentina: false },
      { name: 'Sudáfrica',     flag: 'za', isArgentina: false },
      { name: 'Rep. Checa',    flag: 'cz', isArgentina: false },
    ],
    matches: [
      { home: 'México',        away: 'Sudáfrica',    date: '11 jun', time: '16:00', stadium: 'Estadio Azteca',    city: 'Ciudad de México' },
      { home: 'Corea del Sur', away: 'Rep. Checa',   date: '11 jun', time: '23:00', stadium: 'Estadio Akron',     city: 'Guadalajara' },
      { home: 'México',        away: 'Corea del Sur',date: '15 jun', time: '22:00', stadium: 'Estadio Azteca',    city: 'Ciudad de México' },
      { home: 'Sudáfrica',     away: 'Rep. Checa',   date: '15 jun', time: '22:00', stadium: 'Estadio Monterrey', city: 'Monterrey' },
      { home: 'Sudáfrica',     away: 'Corea del Sur',date: '24 jun', time: '22:00', stadium: 'Estadio Monterrey', city: 'Monterrey' },
      { home: 'Rep. Checa',    away: 'México',       date: '24 jun', time: '22:00', stadium: 'Estadio Akron',     city: 'Guadalajara' },
    ]
  },
  B: {
    color: '#DD6B20',
    teams: [
      { name: 'Canadá',       flag: 'ca', isArgentina: false },
      { name: 'Suiza',        flag: 'ch', isArgentina: false },
      { name: 'Qatar',        flag: 'qa', isArgentina: false },
      { name: 'Bosnia-Herz.', flag: 'ba', isArgentina: false },
    ],
    matches: [
      { home: 'Canadá',       away: 'Bosnia-Herz.', date: '12 jun', time: '16:00', stadium: 'BMO Field',        city: 'Toronto' },
      { home: 'Qatar',        away: 'Suiza',        date: '13 jun', time: '16:00', stadium: "Levi's Stadium",   city: 'Santa Clara' },
      { home: 'Canadá',       away: 'Qatar',        date: '17 jun', time: '19:00', stadium: 'BC Place',         city: 'Vancouver' },
      { home: 'Suiza',        away: 'Bosnia-Herz.', date: '17 jun', time: '19:00', stadium: 'Lincoln Financial Field', city: 'Filadelfia' },
      { home: 'Suiza',        away: 'Canadá',       date: '25 jun', time: '22:00', stadium: 'Arrowhead Stadium', city: 'Kansas City' }, // ⚠️ sede pendiente de verificación
      { home: 'Bosnia-Herz.', away: 'Qatar',        date: '25 jun', time: '22:00', stadium: 'BMO Field',        city: 'Toronto' },
    ]
  },
  C: {
    color: '#D69E2E',
    teams: [
      { name: 'Brasil',    flag: 'br',     isArgentina: false },
      { name: 'Marruecos', flag: 'ma',     isArgentina: false },
      { name: 'Haití',     flag: 'ht',     isArgentina: false },
      { name: 'Escocia',   flag: 'gb-sct', isArgentina: false },
    ],
    matches: [
      { home: 'Brasil',    away: 'Marruecos', date: '13 jun', time: '19:00', stadium: 'MetLife Stadium',       city: 'East Rutherford' },
      { home: 'Haití',     away: 'Escocia',   date: '13 jun', time: '22:00', stadium: 'Gillette Stadium',      city: 'Foxborough' },
      { home: 'Brasil',    away: 'Haití',     date: '18 jun', time: '19:00', stadium: 'MetLife Stadium',       city: 'East Rutherford' },
      { home: 'Marruecos', away: 'Escocia',   date: '18 jun', time: '16:00', stadium: 'Gillette Stadium',      city: 'Foxborough' },
      { home: 'Marruecos', away: 'Haití',     date: '25 jun', time: '19:00', stadium: 'MetLife Stadium',       city: 'East Rutherford' },
      { home: 'Escocia',   away: 'Brasil',    date: '25 jun', time: '19:00', stadium: 'Lincoln Financial Field', city: 'Filadelfia' },
    ]
  },
  D: {
    color: '#38A169',
    teams: [
      { name: 'EE.UU.',    flag: 'us', isArgentina: false },
      { name: 'Paraguay',  flag: 'py', isArgentina: false },
      { name: 'Australia', flag: 'au', isArgentina: false },
      { name: 'Türkiye',   flag: 'tr', isArgentina: false }, // Clasificó: UEFA Playoff Camino C (venció a Kosovo, 31 mar 2026)
    ],
    matches: [
      { home: 'EE.UU.',    away: 'Paraguay',  date: '12 jun', time: '22:00', stadium: 'SoFi Stadium',      city: 'Inglewood' },
      { home: 'Australia', away: 'Türkiye',   date: '14 jun', time: '01:00', stadium: 'BC Place',           city: 'Vancouver' },
      { home: 'EE.UU.',    away: 'Australia', date: '19 jun', time: '19:00', stadium: 'SoFi Stadium',       city: 'Inglewood' },
      { home: 'Paraguay',  away: 'Türkiye',   date: '19 jun', time: '22:00', stadium: 'AT&T Stadium',       city: 'Arlington' },
      { home: 'Paraguay',  away: 'Australia', date: '26 jun', time: '22:00', stadium: 'Hard Rock Stadium',  city: 'Miami' },
      { home: 'Türkiye',   away: 'EE.UU.',    date: '26 jun', time: '22:00', stadium: 'BC Place',           city: 'Vancouver' },
    ]
  },
  E: {
    color: '#3182CE',
    teams: [
      { name: 'Alemania',    flag: 'de', isArgentina: false },
      { name: 'Curaçao',     flag: 'cw', isArgentina: false },
      { name: "C. d'Ivoire", flag: 'ci', isArgentina: false },
      { name: 'Ecuador',     flag: 'ec', isArgentina: false },
    ],
    matches: [
      { home: 'Alemania',    away: 'Curaçao',     date: '14 jun', time: '22:00', stadium: 'MetLife Stadium',       city: 'East Rutherford' },
      { home: "C. d'Ivoire", away: 'Ecuador',     date: '15 jun', time: '16:00', stadium: 'Hard Rock Stadium',     city: 'Miami' },
      { home: 'Alemania',    away: 'Ecuador',     date: '20 jun', time: '22:00', stadium: 'MetLife Stadium',       city: 'East Rutherford' },
      { home: 'Curaçao',     away: "C. d'Ivoire", date: '20 jun', time: '16:00', stadium: 'Gillette Stadium',      city: 'Foxborough' },
      { home: 'Curaçao',     away: 'Ecuador',     date: '26 jun', time: '19:00', stadium: 'Lincoln Financial Field', city: 'Filadelfia' },
      { home: "C. d'Ivoire", away: 'Alemania',    date: '26 jun', time: '19:00', stadium: 'Hard Rock Stadium',     city: 'Miami' },
    ]
  },
  F: {
    color: '#805AD5',
    teams: [
      { name: 'Países Bajos', flag: 'nl', isArgentina: false },
      { name: 'Japón',        flag: 'jp', isArgentina: false },
      { name: 'Túnez',        flag: 'tn', isArgentina: false },
      { name: 'Suecia',       flag: 'se', isArgentina: false }, // Clasificó: UEFA Playoff Camino B
    ],
    matches: [
      { home: 'Países Bajos', away: 'Japón',        date: '14 jun', time: '22:00', stadium: 'AT&T Stadium',      city: 'Arlington' },
      { home: 'Suecia',       away: 'Túnez',        date: '14 jun', time: '19:00', stadium: 'Estadio Monterrey', city: 'Monterrey' },
      { home: 'Países Bajos', away: 'Suecia',       date: '20 jun', time: '22:00', stadium: 'NRG Stadium',       city: 'Houston' },
      { home: 'Túnez',        away: 'Japón',        date: '20 jun', time: '19:00', stadium: 'Estadio Monterrey', city: 'Monterrey' },
      { home: 'Japón',        away: 'Suecia',       date: '25 jun', time: '22:00', stadium: 'AT&T Stadium',      city: 'Arlington' },
      { home: 'Túnez',        away: 'Países Bajos', date: '25 jun', time: '22:00', stadium: 'Arrowhead Stadium', city: 'Kansas City' },
    ]
  },
  G: {
    color: '#D53F8C',
    teams: [
      { name: 'Bélgica',       flag: 'be', isArgentina: false },
      { name: 'Egipto',        flag: 'eg', isArgentina: false },
      { name: 'Irán',          flag: 'ir', isArgentina: false },
      { name: 'Nueva Zelanda', flag: 'nz', isArgentina: false },
    ],
    matches: [
      { home: 'Bélgica',       away: 'Egipto',        date: '15 jun', time: '22:00', stadium: 'Lumen Field',          city: 'Seattle' },
      { home: 'Irán',          away: 'Nueva Zelanda', date: '16 jun', time: '19:00', stadium: 'NRG Stadium',           city: 'Houston' }, // ⚠️ sede pendiente de verificación
      { home: 'Bélgica',       away: 'Irán',          date: '21 jun', time: '16:00', stadium: 'Lincoln Financial Field', city: 'Filadelfia' },
      { home: 'Egipto',        away: 'Nueva Zelanda', date: '21 jun', time: '16:00', stadium: 'Lumen Field',          city: 'Seattle' },
      { home: 'Egipto',        away: 'Irán',          date: '26 jun', time: '16:00', stadium: 'NRG Stadium',           city: 'Houston' }, // ⚠️ sede pendiente de verificación
      { home: 'Nueva Zelanda', away: 'Bélgica',       date: '26 jun', time: '16:00', stadium: 'Lumen Field',          city: 'Seattle' },
    ]
  },
  H: {
    color: '#2C7A7B',
    teams: [
      { name: 'España',         flag: 'es', isArgentina: false },
      { name: 'Cabo Verde',     flag: 'cv', isArgentina: false },
      { name: 'Arabia Saudita', flag: 'sa', isArgentina: false },
      { name: 'Uruguay',        flag: 'uy', isArgentina: false },
    ],
    matches: [
      { home: 'España',         away: 'Cabo Verde',     date: '16 jun', time: '22:00', stadium: 'Estadio Azteca',   city: 'Ciudad de México' },
      { home: 'Arabia Saudita', away: 'Uruguay',        date: '16 jun', time: '22:00', stadium: 'AT&T Stadium',     city: 'Arlington' },
      { home: 'España',         away: 'Arabia Saudita', date: '20 jun', time: '19:00', stadium: 'MetLife Stadium',  city: 'East Rutherford' },
      { home: 'Cabo Verde',     away: 'Uruguay',        date: '20 jun', time: '19:00', stadium: 'Hard Rock Stadium',city: 'Miami' },
      { home: 'Cabo Verde',     away: 'Arabia Saudita', date: '25 jun', time: '22:00', stadium: 'Lumen Field',      city: 'Seattle' },
      { home: 'Uruguay',        away: 'España',         date: '25 jun', time: '22:00', stadium: 'AT&T Stadium',     city: 'Arlington' },
    ]
  },
  I: {
    color: '#744210',
    teams: [
      { name: 'Francia',  flag: 'fr', isArgentina: false },
      { name: 'Senegal',  flag: 'sn', isArgentina: false },
      { name: 'Irak',     flag: 'iq', isArgentina: false },
      { name: 'Noruega',  flag: 'no', isArgentina: false }, // Clasificó: UEFA Playoff Camino A
    ],
    matches: [
      { home: 'Francia',  away: 'Senegal',  date: '16 jun', time: '16:00', stadium: 'MetLife Stadium',       city: 'East Rutherford' },
      { home: 'Irak',     away: 'Noruega',  date: '16 jun', time: '19:00', stadium: 'Gillette Stadium',      city: 'Foxborough' },
      { home: 'Francia',  away: 'Irak',     date: '22 jun', time: '22:00', stadium: 'Lincoln Financial Field', city: 'Filadelfia' },
      { home: 'Noruega',  away: 'Senegal',  date: '22 jun', time: '21:00', stadium: 'MetLife Stadium',       city: 'East Rutherford' },
      { home: 'Noruega',  away: 'Francia',  date: '26 jun', time: '16:00', stadium: 'Gillette Stadium',      city: 'Foxborough' },
      { home: 'Senegal',  away: 'Irak',     date: '26 jun', time: '22:00', stadium: 'BMO Field',             city: 'Toronto' },
    ]
  },
  J: {
    color: '#2D3748',
    teams: [
      { name: 'Argentina', flag: 'ar', isArgentina: true },
      { name: 'Argelia',   flag: 'dz', isArgentina: false },
      { name: 'Austria',   flag: 'at', isArgentina: false },
      { name: 'Jordania',  flag: 'jo', isArgentina: false },
    ],
    matches: [
      { home: 'Argentina', away: 'Argelia',  date: '16 jun', time: '22:00', stadium: 'Arrowhead Stadium',   city: 'Kansas City' },
      { home: 'Austria',   away: 'Jordania', date: '17 jun', time: '01:00', stadium: "Levi's Stadium",      city: 'Santa Clara' },
      { home: 'Argentina', away: 'Austria',  date: '22 jun', time: '14:00', stadium: 'AT&T Stadium',        city: 'Arlington' },
      { home: 'Argelia',   away: 'Jordania', date: '23 jun', time: '00:00', stadium: "Levi's Stadium",      city: 'Santa Clara' },
      { home: 'Argelia',   away: 'Austria',  date: '27 jun', time: '23:00', stadium: 'Arrowhead Stadium',   city: 'Kansas City' },
      { home: 'Jordania',  away: 'Argentina',date: '27 jun', time: '23:00', stadium: 'AT&T Stadium',        city: 'Arlington' },
    ]
  },
  K: {
    color: '#6B46C1',
    teams: [
      { name: 'Portugal',  flag: 'pt', isArgentina: false },
      { name: 'Colombia',  flag: 'co', isArgentina: false },
      { name: 'RD Congo',  flag: 'cd', isArgentina: false }, // República Democrática del Congo (≠ Rep. del Congo)
      { name: 'Uzbekistán',flag: 'uz', isArgentina: false },
    ],
    matches: [
      { home: 'Portugal',  away: 'RD Congo',   date: '18 jun', time: '22:00', stadium: 'NRG Stadium',        city: 'Houston' },
      { home: 'Colombia',  away: 'Uzbekistán', date: '19 jun', time: '16:00', stadium: 'Gillette Stadium',   city: 'Foxborough' },
      { home: 'Portugal',  away: 'Uzbekistán', date: '23 jun', time: '22:00', stadium: 'Lumen Field',        city: 'Seattle' },
      { home: 'RD Congo',  away: 'Colombia',   date: '23 jun', time: '22:00', stadium: 'NRG Stadium',        city: 'Houston' },
      { home: 'RD Congo',  away: 'Uzbekistán', date: '27 jun', time: '22:00', stadium: 'AT&T Stadium',       city: 'Arlington' },
      { home: 'Colombia',  away: 'Portugal',   date: '27 jun', time: '22:00', stadium: 'Hard Rock Stadium',  city: 'Miami' },
    ]
  },
  L: {
    color: '#C05621',
    teams: [
      { name: 'Inglaterra', flag: 'gb-eng', isArgentina: false },
      { name: 'Croacia',    flag: 'hr',     isArgentina: false },
      { name: 'Ghana',      flag: 'gh',     isArgentina: false },
      { name: 'Panamá',     flag: 'pa',     isArgentina: false },
    ],
    matches: [
      { home: 'Inglaterra', away: 'Croacia',    date: '19 jun', time: '22:00', stadium: 'AT&T Stadium',          city: 'Arlington' },
      { home: 'Ghana',      away: 'Panamá',     date: '19 jun', time: '19:00', stadium: 'Lincoln Financial Field', city: 'Filadelfia' },
      { home: 'Inglaterra', away: 'Panamá',     date: '24 jun', time: '19:00', stadium: 'SoFi Stadium',           city: 'Inglewood' },
      { home: 'Croacia',    away: 'Ghana',      date: '24 jun', time: '22:00', stadium: 'AT&T Stadium',           city: 'Arlington' },
      { home: 'Panamá',     away: 'Croacia',    date: '27 jun', time: '19:00', stadium: 'Gillette Stadium',       city: 'Foxborough' },
      { home: 'Ghana',      away: 'Inglaterra', date: '27 jun', time: '19:00', stadium: 'Hard Rock Stadium',      city: 'Miami' },
    ]
  }
};
