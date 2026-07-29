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

export function getJuzRange(juz: number): { startPage: number; endPage: number } {
  if (juz < 1 || juz > 30) return { startPage: 1, endPage: 604 };
  return {
    startPage: JUZ_START_PAGES[juz],
    endPage: JUZ_START_PAGES[juz + 1] - 1
  };
}

export interface SurahInfo {
  id: number;
  name: string;
  startPage: number;
  endPage: number;
}

export const SURAH_LIST: SurahInfo[] = [
  { id: 1, name: "1. Al-Fatihah", startPage: 1, endPage: 1 },
  { id: 2, name: "2. Al-Baqarah", startPage: 2, endPage: 49 },
  { id: 3, name: "3. Ali 'Imran", startPage: 50, endPage: 76 },
  { id: 4, name: "4. An-Nisa'", startPage: 77, endPage: 106 },
  { id: 5, name: "5. Al-Ma'idah", startPage: 106, endPage: 127 },
  { id: 6, name: "6. Al-An'am", startPage: 128, endPage: 150 },
  { id: 7, name: "7. Al-A'raf", startPage: 151, endPage: 176 },
  { id: 8, name: "8. Al-Anfal", startPage: 177, endPage: 186 },
  { id: 9, name: "9. At-Tawbah", startPage: 187, endPage: 207 },
  { id: 10, name: "10. Yunus", startPage: 208, endPage: 221 },
  { id: 11, name: "11. Hud", startPage: 221, endPage: 235 },
  { id: 12, name: "12. Yusuf", startPage: 235, endPage: 248 },
  { id: 13, name: "13. Ar-Ra'd", startPage: 249, endPage: 255 },
  { id: 14, name: "14. Ibrahim", startPage: 255, endPage: 261 },
  { id: 15, name: "15. Al-Hijr", startPage: 262, endPage: 267 },
  { id: 16, name: "16. An-Nahl", startPage: 267, endPage: 281 },
  { id: 17, name: "17. Al-Isra'", startPage: 282, endPage: 293 },
  { id: 18, name: "18. Al-Kahf", startPage: 293, endPage: 304 },
  { id: 19, name: "19. Maryam", startPage: 305, endPage: 312 },
  { id: 20, name: "20. Taha", startPage: 312, endPage: 321 },
  { id: 21, name: "21. Al-Anbiya'", startPage: 322, endPage: 331 },
  { id: 22, name: "22. Al-Hajj", startPage: 332, endPage: 341 },
  { id: 23, name: "23. Al-Mu'minun", startPage: 342, endPage: 349 },
  { id: 24, name: "24. An-Nur", startPage: 350, endPage: 359 },
  { id: 25, name: "25. Al-Furqan", startPage: 359, endPage: 366 },
  { id: 26, name: "26. Ash-Shu'ara'", startPage: 367, endPage: 376 },
  { id: 27, name: "27. An-Naml", startPage: 377, endPage: 385 },
  { id: 28, name: "28. Al-Qasas", startPage: 385, endPage: 396 },
  { id: 29, name: "29. Al-'Ankabut", startPage: 396, endPage: 404 },
  { id: 30, name: "30. Ar-Rum", startPage: 404, endPage: 410 },
  { id: 31, name: "31. Luqman", startPage: 411, endPage: 414 },
  { id: 32, name: "32. As-Sajdah", startPage: 415, endPage: 417 },
  { id: 33, name: "33. Al-Ahzab", startPage: 418, endPage: 427 },
  { id: 34, name: "34. Saba'", startPage: 428, endPage: 434 },
  { id: 35, name: "35. Fatir", startPage: 434, endPage: 440 },
  { id: 36, name: "36. Ya-Sin", startPage: 440, endPage: 445 },
  { id: 37, name: "37. As-Saffat", startPage: 446, endPage: 452 },
  { id: 38, name: "38. Sad", startPage: 453, endPage: 458 },
  { id: 39, name: "39. Az-Zumar", startPage: 458, endPage: 467 },
  { id: 40, name: "40. Ghafir", startPage: 467, endPage: 476 },
  { id: 41, name: "41. Fussilat", startPage: 477, endPage: 482 },
  { id: 42, name: "42. Ash-Shura", startPage: 483, endPage: 489 },
  { id: 43, name: "43. Az-Zukhruf", startPage: 489, endPage: 495 },
  { id: 44, name: "44. Ad-Dukhan", startPage: 496, endPage: 498 },
  { id: 45, name: "45. Al-Jathiyah", startPage: 499, endPage: 502 },
  { id: 46, name: "46. Al-Ahqaf", startPage: 502, endPage: 506 },
  { id: 47, name: "47. Muhammad", startPage: 507, endPage: 510 },
  { id: 48, name: "48. Al-Fath", startPage: 511, endPage: 515 },
  { id: 49, name: "49. Al-Hujurat", startPage: 515, endPage: 517 },
  { id: 50, name: "50. Qaf", startPage: 518, endPage: 520 },
  { id: 51, name: "51. Ad-Dhariyat", startPage: 520, endPage: 523 },
  { id: 52, name: "52. At-Tur", startPage: 523, endPage: 525 },
  { id: 53, name: "53. An-Najm", startPage: 526, endPage: 528 },
  { id: 54, name: "54. Al-Qamar", startPage: 528, endPage: 531 },
  { id: 55, name: "55. Ar-Rahman", startPage: 531, endPage: 534 },
  { id: 56, name: "56. Al-Waqi'ah", startPage: 534, endPage: 537 },
  { id: 57, name: "57. Al-Hadid", startPage: 537, endPage: 541 },
  { id: 58, name: "58. Al-Mujadila", startPage: 542, endPage: 545 },
  { id: 59, name: "59. Al-Hashr", startPage: 545, endPage: 548 },
  { id: 60, name: "60. Al-Mumtahanah", startPage: 549, endPage: 551 },
  { id: 61, name: "61. As-Saff", startPage: 551, endPage: 552 },
  { id: 62, name: "62. Al-Jumu'ah", startPage: 553, endPage: 554 },
  { id: 63, name: "63. Al-Munafiqun", startPage: 554, endPage: 555 },
  { id: 64, name: "64. At-Taghabun", startPage: 556, endPage: 557 },
  { id: 65, name: "65. At-Talaq", startPage: 558, endPage: 559 },
  { id: 66, name: "66. At-Tahrim", startPage: 560, endPage: 561 },
  { id: 67, name: "67. Al-Mulk", startPage: 562, endPage: 564 },
  { id: 68, name: "68. Al-Qalam", startPage: 564, endPage: 566 },
  { id: 69, name: "69. Al-Haqqah", startPage: 566, endPage: 568 },
  { id: 70, name: "70. Al-Ma'arij", startPage: 568, endPage: 570 },
  { id: 71, name: "71. Nuh", startPage: 570, endPage: 571 },
  { id: 72, name: "72. Al-Jinn", startPage: 572, endPage: 573 },
  { id: 73, name: "73. Al-Muzzammil", startPage: 574, endPage: 575 },
  { id: 74, name: "74. Al-Muddaththir", startPage: 575, endPage: 577 },
  { id: 75, name: "75. Al-Qiyamah", startPage: 577, endPage: 578 },
  { id: 76, name: "76. Al-Insan", startPage: 578, endPage: 580 },
  { id: 77, name: "77. Al-Mursalat", startPage: 580, endPage: 581 },
  { id: 78, name: "78. An-Naba'", startPage: 582, endPage: 583 },
  { id: 79, name: "79. An-Nazi'at", startPage: 583, endPage: 584 },
  { id: 80, name: "80. 'Abasa", startPage: 585, endPage: 585 },
  { id: 81, name: "81. At-Takwir", startPage: 586, endPage: 586 },
  { id: 82, name: "82. Al-Infitar", startPage: 587, endPage: 587 },
  { id: 83, name: "83. Al-Mutaffifin", startPage: 587, endPage: 589 },
  { id: 84, name: "84. Al-Inshiqaq", startPage: 589, endPage: 590 },
  { id: 85, name: "85. Al-Buruj", startPage: 590, endPage: 590 },
  { id: 86, name: "86. At-Tariq", startPage: 591, endPage: 591 },
  { id: 87, name: "87. Al-A'la", startPage: 591, endPage: 592 },
  { id: 88, name: "88. Al-Ghashiyah", startPage: 592, endPage: 593 },
  { id: 89, name: "89. Al-Fajr", startPage: 593, endPage: 594 },
  { id: 90, name: "90. Al-Balad", startPage: 594, endPage: 595 },
  { id: 91, name: "91. Ash-Shams", startPage: 595, endPage: 595 },
  { id: 92, name: "92. Al-Layl", startPage: 595, endPage: 596 },
  { id: 93, name: "93. Ad-Duha", startPage: 596, endPage: 596 },
  { id: 94, name: "94. Ash-Sharh", startPage: 596, endPage: 596 },
  { id: 95, name: "95. At-Tin", startPage: 597, endPage: 597 },
  { id: 96, name: "96. Al-'Alaq", startPage: 597, endPage: 597 },
  { id: 97, name: "97. Al-Qadr", startPage: 598, endPage: 598 },
  { id: 98, name: "98. Al-Bayyinah", startPage: 598, endPage: 599 },
  { id: 99, name: "99. Az-Zalzalah", startPage: 599, endPage: 599 },
  { id: 100, name: "100. Al-'Adiyat", startPage: 599, endPage: 600 },
  { id: 101, name: "101. Al-Qari'ah", startPage: 600, endPage: 600 },
  { id: 102, name: "102. At-Takathur", startPage: 600, endPage: 600 },
  { id: 103, name: "103. Al-'Asr", startPage: 601, endPage: 601 },
  { id: 104, name: "104. Al-Humazah", startPage: 601, endPage: 601 },
  { id: 105, name: "105. Al-Fil", startPage: 601, endPage: 601 },
  { id: 106, name: "106. Quraysh", startPage: 602, endPage: 602 },
  { id: 107, name: "107. Al-Ma'un", startPage: 602, endPage: 602 },
  { id: 108, name: "108. Al-Kawthar", startPage: 602, endPage: 602 },
  { id: 109, name: "109. Al-Kafirun", startPage: 603, endPage: 603 },
  { id: 110, name: "110. An-Nasr", startPage: 603, endPage: 603 },
  { id: 111, name: "111. Al-Masad", startPage: 603, endPage: 603 },
  { id: 112, name: "112. Al-Ikhlas", startPage: 604, endPage: 604 },
  { id: 113, name: "113. Al-Falaq", startPage: 604, endPage: 604 },
  { id: 114, name: "114. An-Nas", startPage: 604, endPage: 604 }
];

