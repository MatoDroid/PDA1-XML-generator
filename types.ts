
export interface Address {
  ulica: string;
  supisneCislo: string;
  orientacneCislo: string;
  obec: string;
  psc: string;
  stat: string;
}

export interface PostingPlace {
  nazov: string;
  ico: string;
  adresa: Address;
}

export interface FormDataState {
  // Ziadatel
  titulPred: string;
  meno: string;
  priezvisko: string;
  rodnePriezvisko: string;
  titulZa: string;
  rodneCislo: string;
  datumNarodenia: string;
  miestoNarodenia: string;
  statNarodenia: string;
  statnaPrislusnost: string;
  pohlavie: '1' | '2' | ''; // 1-muz, 2-zena
  adresaPobytu: Address;
  email: string;
  telefon: string;
  pobytovyPreukaz: boolean;

  zadatAdresuPrechodnehoPobytu: boolean;
  adresaPrechodnehoPobytu: Address;

  zadatKorespodencnuAdresu: boolean;
  korespodencnaAdresa: Address;
  
  // Podnikanie
  ico: string;
  obchodneMeno: string;
  datumZaciatkuCinnosti: string;
  identifikacneCisloVSocialnejPoistovni: string;
  cinnostSZCONaSlovensku: string;
  skNace: string; // Kód ekonomickej klasifikácie

  zadatAdresuMiestaPodnikania: boolean;
  adresaMiestaPodnikania: Address;

  // Vyslanie
  statVyslania: string; // Hlavný štát vyslania (zvyčajne prvý alebo prevažujúci)
  miestaVyslania: PostingPlace[];
  datumZaciatkuVyslania: string;
  datumKoncaVyslania: string;
  popisCinnosti: string;
  
  obvykleMiestoVykonuCinnosti: boolean;
  nahradenieOsoby: boolean;
  vykonavanieCinnostiPreInuOsobu: boolean;
  najomPracovnejSily: boolean;
  
  // Ostatne
  pobocka: string; // Kód pobočky SP
  poznamka: string;
  isForeigner: boolean;
}
