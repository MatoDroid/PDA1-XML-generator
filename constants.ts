
export const COUNTRY_MAP: Record<string, string> = {
  "Slovenská republika": "703",
  "Belgicko": "056",
  "Bulharsko": "100",
  "Cyprus": "196",
  "Česká republika": "203",
  "Dánsko": "208",
  "Estónsko": "233",
  "Fínsko": "246",
  "Francúzsko": "250",
  "Grécko": "300",
  "Holandsko": "528",
  "Chorvátsko": "191",
  "Írsko": "372",
  "Island": "352",
  "Lichtenštajnsko": "438",
  "Litva": "440",
  "Lotyšsko": "428",
  "Luxembursko": "442",
  "Maďarsko": "348",
  "Malta": "470",
  "Nemecko": "276",
  "Nórsko": "578",
  "Poľsko": "616",
  "Portugalsko": "620",
  "Rakúsko": "040",
  "Rumunsko": "642",
  "Slovinsko": "705",
  "Spojené kráľovstvo": "826",
  "Španielsko": "724",
  "Švajčiarsko": "756",
  "Švédsko": "752",
  "Taliansko": "380"
};

export const COUNTRIES = Object.keys(COUNTRY_MAP).sort((a, b) => {
    if (a === "Slovenská republika") return -1;
    if (b === "Slovenská republika") return 1;
    return a.localeCompare(b, 'sk');
});

export const BRANCH_OFFICES = [
  { code: "BA", name: "Bratislava" },
  { code: "TT", name: "Trnava" },
  { code: "TN", name: "Trenčín" },
  { code: "NR", name: "Nitra" },
  { code: "ZA", name: "Žilina" },
  { code: "BB", name: "Banská Bystrica" },
  { code: "PO", name: "Prešov" },
  { code: "KE", name: "Košice" },
  { code: "SN", name: "Spišská Nová Ves" },
  { code: "PB", name: "Považská Bystrica" },
  { code: "CA", name: "Čadca" },
  { code: "DK", name: "Dolný Kubín" },
  { code: "LM", name: "Liptovský Mikuláš" },
  { code: "MT", name: "Martin" },
  { code: "RV", name: "Rožňava" },
  { code: "PP", name: "Poprad" },
  { code: "SL", name: "Stará Ľubovňa" },
  { code: "HE", name: "Humenné" },
  { code: "MI", name: "Michalovce" },
  { code: "TV", name: "Trebišov" },
  { code: "BJ", name: "Bardejov" },
  { code: "SK", name: "Svidník" },
  { code: "VT", name: "Vranov nad Topľou" },
  { code: "SE", name: "Senica" },
  { code: "GA", name: "Galanta" },
  { code: "DS", name: "Dunajská Streda" },
  { code: "LV", name: "Levice" },
  { code: "NZ", name: "Nové Zámky" },
  { code: "KN", name: "Komárno" },
  { code: "TO", name: "Topoľčany" },
  { code: "ZV", name: "Zvolen" },
  { code: "ZH", name: "Žiar nad Hronom" },
  { code: "PD", name: "Prievidza" },
  { code: "RS", name: "Rimavská Sobota" },
  { code: "LC", name: "Lučenec" },
  { code: "VK", name: "Veľký Krtíš" }
].sort((a, b) => a.name.localeCompare(b.name, 'sk'));

export const NACE_CATEGORIES = [
  { code: "1", name: "A – Poľnohospodárstvo, lesníctvo a rybolov" },
  { code: "2", name: "C – Priemyselná výroba" },
  { code: "3", name: "F – Stavebníctvo" },
  { code: "4", name: "G – Veľkoobchod a maloobchod" },
  { code: "5", name: "H – Doprava a skladovanie" },
  { code: "6", name: "I – Ubytovacie a stravovacie služby" }
];

export const TITLES_BEFORE = [
  "Bc.", "Mgr.", "Ing.", "MUDr.", "MVDr.", "PaedDr.", "PharmDr.", "PhDr.", "JUDr.", "RNDr.", "ThDr.", "doc.", "prof."
].sort();

export const TITLES_AFTER = [
  "PhD.", "CSc.", "DrSc.", "MBA", "MPH", "LL.M."
].sort();
