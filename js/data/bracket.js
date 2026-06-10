// Bracket de eliminatorias — fixture oficial FIFA World Cup 2026
// Estructura real: Ronda de 32 (16 partidos) → Octavos (8) → Cuartos (4) → Semis (2) → Final
// Notación: "1A" = 1er lugar Grupo A · "3ABCDF" = mejor 3ro entre esos grupos · "G M73" = ganador del partido 73
const BRACKET = {

  // ============================================================
  // RONDA DE 32 — partidos 73 al 88 (28 jun – 3 jul)
  // 32 clasificados de fase de grupos → 16 clasificados a octavos
  // ============================================================
  ronda32: [
    // Lado A del árbol
    { id: 'R32-1',  label: 'M73', home: '2A',      away: '2B',      date: '28 jun', isArgPath: false },
    { id: 'R32-2',  label: 'M74', home: '1E',      away: '3ABCDF',  date: '29 jun', isArgPath: false },
    { id: 'R32-3',  label: 'M75', home: '1F',      away: '2C',      date: '29 jun', isArgPath: false },
    { id: 'R32-4',  label: 'M76', home: '1C',      away: '2F',      date: '29 jun', isArgPath: false },
    { id: 'R32-5',  label: 'M77', home: '1I',      away: '3CDFGH',  date: '30 jun', isArgPath: false },
    { id: 'R32-6',  label: 'M78', home: '2E',      away: '2I',      date: '30 jun', isArgPath: false },
    { id: 'R32-7',  label: 'M79', home: '1A',      away: '3CEFHI',  date: '30 jun', isArgPath: false },
    { id: 'R32-8',  label: 'M80', home: '1L',      away: '3EHIJK',  date: '1 jul',  isArgPath: false },
    // Lado B del árbol — camino de Argentina
    { id: 'R32-9',  label: 'M81', home: '1D',      away: '3BEFIJ',  date: '1 jul',  isArgPath: false },
    { id: 'R32-10', label: 'M82', home: '1G',      away: '3AEHIJ',  date: '1 jul',  isArgPath: false },
    { id: 'R32-11', label: 'M83', home: '2K',      away: '2L',      date: '2 jul',  isArgPath: false },
    { id: 'R32-12', label: 'M84', home: '1H',      away: '2J',      date: '2 jul',  isArgPath: false }, // Argentina si termina 2°
    { id: 'R32-13', label: 'M85', home: '1B',      away: '3EFGIJ',  date: '2 jul',  isArgPath: false },
    { id: 'R32-14', label: 'M86', home: '1J',      away: '2H',      date: '3 jul',  isArgPath: true  }, // Argentina si termina 1° → Hard Rock Stadium, Miami
    { id: 'R32-15', label: 'M87', home: '1K',      away: '3DEIJL',  date: '3 jul',  isArgPath: false },
    { id: 'R32-16', label: 'M88', home: '2D',      away: '2G',      date: '3 jul',  isArgPath: false },
  ],

  // ============================================================
  // OCTAVOS DE FINAL — (5 jul – 8 jul)
  // ============================================================
  octavos: [
    { id: 'R16-1', label: 'O1', home: 'G M73', away: 'G M74', date: '5 jul', isArgPath: false },
    { id: 'R16-2', label: 'O2', home: 'G M75', away: 'G M76', date: '5 jul', isArgPath: false },
    { id: 'R16-3', label: 'O3', home: 'G M77', away: 'G M78', date: '6 jul', isArgPath: false },
    { id: 'R16-4', label: 'O4', home: 'G M79', away: 'G M80', date: '6 jul', isArgPath: false },
    { id: 'R16-5', label: 'O5', home: 'G M81', away: 'G M82', date: '7 jul', isArgPath: false },
    { id: 'R16-6', label: 'O6', home: 'G M83', away: 'G M84', date: '7 jul', isArgPath: false },
    { id: 'R16-7', label: 'O7', home: 'G M85', away: 'G M86', date: '8 jul', isArgPath: true  }, // Argentina path
    { id: 'R16-8', label: 'O8', home: 'G M87', away: 'G M88', date: '8 jul', isArgPath: false },
  ],

  // ============================================================
  // CUARTOS DE FINAL — (9 jul – 11 jul)
  // ============================================================
  cuartos: [
    { id: 'QF-1', label: 'C1', home: 'G O1', away: 'G O2', date: '9 jul',  isArgPath: false },
    { id: 'QF-2', label: 'C2', home: 'G O3', away: 'G O4', date: '10 jul', isArgPath: false },
    { id: 'QF-3', label: 'C3', home: 'G O5', away: 'G O6', date: '10 jul', isArgPath: false },
    { id: 'QF-4', label: 'C4', home: 'G O7', away: 'G O8', date: '9 jul',  isArgPath: true  }, // Argentina path
  ],

  // ============================================================
  // SEMIFINALES — (14 jul – 15 jul)
  // ============================================================
  semis: [
    { id: 'SF-1', label: 'SF1', home: 'G C1', away: 'G C2', date: '14 jul', isArgPath: false },
    { id: 'SF-2', label: 'SF2', home: 'G C3', away: 'G C4', date: '15 jul', isArgPath: true  }, // Argentina path
  ],

  final: {
    id: 'FIN',
    home: 'G SF1',
    away: 'G SF2',
    date: '19 jul 2026',
    stadium: 'MetLife Stadium, East Rutherford'
  },
  tercero: {
    id: '3RD',
    home: 'Perd. SF1',
    away: 'Perd. SF2',
    date: '18 jul 2026',
    stadium: 'Hard Rock Stadium, Miami'
  },
};
