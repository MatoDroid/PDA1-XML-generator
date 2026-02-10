
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
  { code: "SN", name: "Spišská Nová Ves" }
].sort((a, b) => a.name.localeCompare(b.name, 'sk'));

export const NACE_CATEGORIES = [
  { code: "1", name: "A – Poľnohospodárstvo, lesníctvo a rybolov" },
  { code: "2", name: "C – Priemyselná výroba" },
  { code: "3", name: "F – Stavebníctvo" },
  { code: "4", name: "G – Veľkoobchod a maloobchod" },
  { code: "5", name: "H – Doprava a skladovanie" },
  { code: "6", name: "I – Ubytovacie a stravovacie služby" }
];
