/**
 * Moroccan cities for the order form (searchable list).
 * `name` is the Latin name saved in the database; `ar` is shown on the Arabic site.
 * A customer from a small town that is not in the list can still type its name.
 */
export type City = { name: string; ar: string };

export const CASABLANCA = "Casablanca";

export const cities: City[] = [
  { name: "Casablanca", ar: "الدار البيضاء" },
  { name: "Rabat", ar: "الرباط" },
  { name: "Marrakech", ar: "مراكش" },
  { name: "Fès", ar: "فاس" },
  { name: "Tanger", ar: "طنجة" },
  { name: "Agadir", ar: "أكادير" },
  { name: "Meknès", ar: "مكناس" },
  { name: "Oujda", ar: "وجدة" },
  { name: "Kénitra", ar: "القنيطرة" },
  { name: "Tétouan", ar: "تطوان" },
  { name: "Salé", ar: "سلا" },
  { name: "Témara", ar: "تمارة" },
  { name: "Mohammedia", ar: "المحمدية" },
  { name: "El Jadida", ar: "الجديدة" },
  { name: "Safi", ar: "آسفي" },
  { name: "Béni Mellal", ar: "بني ملال" },
  { name: "Nador", ar: "الناظور" },
  { name: "Khouribga", ar: "خريبكة" },
  { name: "Settat", ar: "سطات" },
  { name: "Berrechid", ar: "برشيد" },
  { name: "Laâyoune", ar: "العيون" },
  { name: "Dakhla", ar: "الداخلة" },
  { name: "Essaouira", ar: "الصويرة" },
  { name: "Ouarzazate", ar: "ورزازات" },
  { name: "Errachidia", ar: "الرشيدية" },
  { name: "Al Hoceïma", ar: "الحسيمة" },
  { name: "Taza", ar: "تازة" },
  { name: "Larache", ar: "العرائش" },
  { name: "Ksar El Kébir", ar: "القصر الكبير" },
  { name: "Khémisset", ar: "الخميسات" },
  { name: "Guelmim", ar: "كلميم" },
  { name: "Tiznit", ar: "تيزنيت" },
  { name: "Taroudant", ar: "تارودانت" },
  { name: "Inezgane", ar: "إنزكان" },
  { name: "Aït Melloul", ar: "أيت ملول" },
  { name: "Berkane", ar: "بركان" },
  { name: "Taourirt", ar: "تاوريرت" },
  { name: "Guercif", ar: "جرسيف" },
  { name: "Jerada", ar: "جرادة" },
  { name: "Figuig", ar: "فكيك" },
  { name: "Bouarfa", ar: "بوعرفة" },
  { name: "Zaïo", ar: "زايو" },
  { name: "Selouane", ar: "سلوان" },
  { name: "Driouch", ar: "الدريوش" },
  { name: "Imzouren", ar: "إمزورن" },
  { name: "Chefchaouen", ar: "شفشاون" },
  { name: "Ouezzane", ar: "وزان" },
  { name: "M'diq", ar: "المضيق" },
  { name: "Fnideq", ar: "الفنيدق" },
  { name: "Martil", ar: "مرتيل" },
  { name: "Asilah", ar: "أصيلة" },
  { name: "Sidi Kacem", ar: "سيدي قاسم" },
  { name: "Sidi Slimane", ar: "سيدي سليمان" },
  { name: "Sidi Yahya El Gharb", ar: "سيدي يحيى الغرب" },
  { name: "Mechra Bel Ksiri", ar: "مشرع بلقصيري" },
  { name: "Souk El Arbaa", ar: "سوق الأربعاء" },
  { name: "Tiflet", ar: "تيفلت" },
  { name: "Rommani", ar: "الرماني" },
  { name: "Skhirat", ar: "الصخيرات" },
  { name: "Bouznika", ar: "بوزنيقة" },
  { name: "Benslimane", ar: "بنسليمان" },
  { name: "Bouskoura", ar: "بوسكورة" },
  { name: "Dar Bouazza", ar: "دار بوعزة" },
  { name: "Nouaceur", ar: "النواصر" },
  { name: "Médiouna", ar: "مديونة" },
  { name: "Tit Mellil", ar: "تيط مليل" },
  { name: "Aïn Harrouda", ar: "عين حرودة" },
  { name: "Had Soualem", ar: "حد السوالم" },
  { name: "Azemmour", ar: "أزمور" },
  { name: "Sidi Bennour", ar: "سيدي بنور" },
  { name: "Youssoufia", ar: "اليوسفية" },
  { name: "Benguerir", ar: "بن جرير" },
  { name: "El Kelaâ des Sraghna", ar: "قلعة السراغنة" },
  { name: "Chichaoua", ar: "شيشاوة" },
  { name: "Tamensourt", ar: "تامنصورت" },
  { name: "Aït Ourir", ar: "أيت أورير" },
  { name: "Fquih Ben Salah", ar: "الفقيه بن صالح" },
  { name: "Kasba Tadla", ar: "قصبة تادلة" },
  { name: "Oued Zem", ar: "وادي زم" },
  { name: "Boujaad", ar: "أبي الجعد" },
  { name: "Azilal", ar: "أزيلال" },
  { name: "Demnate", ar: "دمنات" },
  { name: "Khénifra", ar: "خنيفرة" },
  { name: "Midelt", ar: "ميدلت" },
  { name: "Ifrane", ar: "إفران" },
  { name: "Azrou", ar: "أزرو" },
  { name: "El Hajeb", ar: "الحاجب" },
  { name: "Sefrou", ar: "صفرو" },
  { name: "Missour", ar: "ميسور" },
  { name: "Tahla", ar: "تاهلة" },
  { name: "Erfoud", ar: "أرفود" },
  { name: "Rissani", ar: "الريصاني" },
  { name: "Tinghir", ar: "تنغير" },
  { name: "Zagora", ar: "زاكورة" },
  { name: "Kelaat M'Gouna", ar: "قلعة مكونة" },
  { name: "Biougra", ar: "بيوكرى" },
  { name: "Oulad Teima", ar: "أولاد تايمة" },
  { name: "Tata", ar: "طاطا" },
  { name: "Tan-Tan", ar: "طانطان" },
  { name: "Sidi Ifni", ar: "سيدي إفني" },
  { name: "Boujdour", ar: "بوجدور" },
  { name: "Smara", ar: "السمارة" },
];

/** Lowercase, no accents, no punctuation: "Fès" → "fes", "M'diq" → "mdiq". */
export function normalizeCityText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, "");
}

/** Finds a city from what the customer typed, in Latin or Arabic letters. */
export function findCity(value: string): City | undefined {
  const key = normalizeCityText(value);
  if (!key) return undefined;
  return cities.find((c) => normalizeCityText(c.name) === key || normalizeCityText(c.ar) === key);
}

/** The city name to save: the known Latin name when found, otherwise what was typed. */
export function canonicalCity(value: string): string {
  return findCity(value)?.name ?? value.trim().replace(/\s+/g, " ");
}

export const isCasablanca = (value: string) => findCity(value)?.name === CASABLANCA;
