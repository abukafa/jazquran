// Peta halaman awal setiap Juz pada Mushaf Madinah standar (604 halaman)
// Index 1 adalah Juz 1, Index 30 adalah Juz 30
export const JUZ_START_PAGES = [
  0, 
  1, 22, 42, 62, 82, 102, 122, 142, 162, 182, 
  202, 222, 242, 262, 282, 302, 322, 342, 362, 382, 
  402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
  605 // Batas akhir semu untuk memudahkan kalkulasi (604 + 1)
];

// Mendapatkan total halaman dalam suatu Juz
export function getPagesInJuz(juz: number): number {
  if (juz < 1 || juz > 30) return 20;
  return JUZ_START_PAGES[juz + 1] - JUZ_START_PAGES[juz];
}

// Konversi (Juz, Hal Relatif, a/b) menjadi ID Setengah Halaman Absolut (1 s/d 1208)
// halRelatif adalah angka (1, 2, ...), part adalah 'a' atau 'b'
export function toAbsoluteHalfPage(juz: number, halRelatif: number, part: 'a' | 'b'): number {
  const absolutePage = JUZ_START_PAGES[juz] + halRelatif - 1;
  return (absolutePage - 1) * 2 + (part === 'a' ? 1 : 2);
}

// Konversi ID Setengah Halaman Absolut kembali ke (Juz, Hal Relatif, a/b)
export function fromAbsoluteHalfPage(absoluteHalfPage: number) {
  // Cegah nilai di bawah 1 (misal mundur dari Al-Fatihah hal 1)
  if (absoluteHalfPage < 1) absoluteHalfPage = 1;
  if (absoluteHalfPage > 1208) absoluteHalfPage = 1208;

  const part = absoluteHalfPage % 2 === 1 ? 'a' : 'b';
  const absolutePage = Math.floor((absoluteHalfPage - 1) / 2) + 1;

  let juz = 1;
  for (let i = 1; i <= 30; i++) {
    if (absolutePage >= JUZ_START_PAGES[i] && absolutePage < JUZ_START_PAGES[i + 1]) {
      juz = i;
      break;
    }
  }

  const halRelatif = absolutePage - JUZ_START_PAGES[juz] + 1;
  return { juz, halRelatif, part, stringFormat: `${halRelatif}${part}` };
}

// Kalkulator Mundur 5 Halaman (10 half-pages)
export function calculateBinNadzorRange(
  ziyadahJuz: number, 
  ziyadahHalKe: string | number // format misal "10a" atau angka lama "10"
) {
  if (!ziyadahHalKe) return null;
  
  // Konversi format lama (number) ke string "10a"
  let stringHalKe = String(ziyadahHalKe).trim();
  if (!stringHalKe.endsWith('a') && !stringHalKe.endsWith('b')) {
    stringHalKe += 'a';
  }

  const matchKe = stringHalKe.match(/^(\d+)([ab])$/);
  if (!matchKe) return null;

  const halRelatifKe = parseInt(matchKe[1], 10);
  const partKe = matchKe[2] as 'a' | 'b';

  const absHalfKe = toAbsoluteHalfPage(ziyadahJuz, halRelatifKe, partKe);
  const absHalfDari = absHalfKe - 9; // Mundur 9 langkah untuk mendapat block 10 bagian

  const dari = fromAbsoluteHalfPage(absHalfDari);
  const ke = fromAbsoluteHalfPage(absHalfKe);

  return {
    juzDari: dari.juz,
    halDari: dari.stringFormat,
    juzKe: ke.juz,
    halKe: ke.stringFormat,
  };
}

// Konversi (Juz, format lokal misal "1a" atau "2b") menjadi Halaman Global Mushaf (1 s/d 604)
// Sangat berguna untuk integrasi dengan API Quran (seperti api.quran.com)
export function toGlobalPage(juz: number, stringHal: string | number): number {
  if (!stringHal) return JUZ_START_PAGES[juz] || 1;
  let halStr = String(stringHal).trim();
  
  // Format legacy atau hanya angka: asumsikan "a"
  if (!halStr.endsWith('a') && !halStr.endsWith('b')) {
    halStr += 'a';
  }
  
  const match = halStr.match(/^(\d+)([ab])$/);
  if (!match) return JUZ_START_PAGES[juz] || 1;
  
  const halRelatif = parseInt(match[1], 10);
  
  // Halaman absolut = Halaman awal Juz + halaman relatif - 1
  return JUZ_START_PAGES[juz] + halRelatif - 1;
}

