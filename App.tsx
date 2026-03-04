
import React, { useState, useCallback, useEffect } from 'react';
import type { FormDataState, Address } from './types';
import FormSection from './components/FormSection';
import InputField from './components/InputField';
import SelectField from './components/SelectField';
import ThemeSwitcher from './components/ThemeSwitcher';
import CheckboxField from './components/CheckboxField';
import AddressFields from './components/AddressFields';
import { COUNTRIES, BRANCH_OFFICES, NACE_CATEGORIES, TITLES_BEFORE, TITLES_AFTER } from './constants';
import { BRANCH_OFFICE_BY_PSC } from './psc_mapping';
import { generateA1Xml, parseBirthDateFromRc } from './utils';
import { useRpo } from './hooks/useRpo';

const emptyAddress: Address = { ulica: '', supisneCislo: '', orientacneCislo: '', obec: '', psc: '', stat: 'Slovenská republika' };

const initialFormData: FormDataState = {
  titulPred: '', meno: '', priezvisko: '', rodnePriezvisko: '', titulZa: '', rodneCislo: '', datumNarodenia: '', miestoNarodenia: '',
  statNarodenia: 'Slovenská republika', statnaPrislusnost: 'Slovenská republika', pohlavie: 'Muž', adresaPobytu: { ...emptyAddress },
  email: '', telefon: '', pobytovyPreukaz: false,
  zadatAdresuPrechodnehoPobytu: false, adresaPrechodnehoPobytu: { ...emptyAddress },
  zadatKorespodencnuAdresu: false, korespodencnaAdresa: { ...emptyAddress },
  ico: '', obchodneMeno: '', datumZaciatkuCinnosti: '', identifikacneCisloVSocialnejPoistovni: '', cinnostSZCONaSlovensku: '', skNace: '3',
  zadatAdresuMiestaPodnikania: false, adresaMiestaPodnikania: { ...emptyAddress },
  statVyslania: '', adresaVyslania: { ...emptyAddress, stat: '' }, datumZaciatkuVyslania: '', datumKoncaVyslania: '',
  obchodneMenoPrijimajucejOsoby: '', icoPrijimajucejOsoby: '', popisCinnosti: '',
  obvykleMiestoVykonuCinnosti: true, nahradenieOsoby: false, vykonavanieCinnostiPreInuOsobu: false, najomPracovnejSily: false,
  pobocka: 'BA', poznamka: '', isForeigner: false
};

const SpinnerIcon = () => (
  <svg className="animate-spin h-6 w-6 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const CheckIcon = () => (
  <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const App: React.FC = () => {
  const [step, setStep] = useState<'welcome' | 'form'>('welcome');
  const [formData, setFormData] = useState<FormDataState>(initialFormData);
  const { loading: rpoLoading, error: rpoError, success: icoFetchSuccess } = useRpo(formData.ico, setFormData);

  useEffect(() => {
    if (icoFetchSuccess && step === 'welcome') {
      const timer = setTimeout(() => setStep('form'), 1000);
      return () => clearTimeout(timer);
    }
  }, [icoFetchSuccess, step]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;

    setFormData(prev => {
      let newState = { ...prev };
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        const parentKey = parent as keyof FormDataState;
        newState = { ...newState, [parentKey]: { ...(newState[parentKey] as object), [child]: value } };
      } else {
        newState = { ...newState, [name]: type === 'checkbox' ? checked : value };
      }
      if (name === 'rodneCislo') {
         const birthDate = parseBirthDateFromRc(value);
         if (birthDate) newState.datumNarodenia = birthDate;
      }
      
      // Auto-select branch based on PSC (adresaPobytu.psc)
      if (name === 'adresaPobytu.psc') {
        const cleanPsc = value.replace(/\s/g, '');
        const branchCode = BRANCH_OFFICE_BY_PSC[cleanPsc];
        if (branchCode) {
          newState.pobocka = branchCode;
        }
      }
      
      return newState;
    });
  }, []);

  if (step === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4 transition-colors duration-500">
        <ThemeSwitcher />
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Vitajte</h1>
            <p className="text-gray-600 dark:text-gray-400">Zadajte IČO pre automatické vyplnenie údajov.</p>
          </div>
          <div className="space-y-6">
            <div className="relative">
              <label htmlFor="ico-welcome" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">IČO podnikateľa</label>
              <div className="relative">
                <input id="ico-welcome" name="ico" type="text" inputMode="numeric" placeholder="33852383" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-lg tracking-wider dark:text-white" value={formData.ico} onChange={handleChange} />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  {rpoLoading ? <SpinnerIcon /> : icoFetchSuccess ? <CheckIcon /> : null}
                </div>
              </div>
              {rpoError && <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{rpoError}</p>}
            </div>
            <div className="flex flex-col space-y-3 pt-2">
              <div className="h-8 flex items-center justify-center text-sm font-medium transition-all duration-300">
                {rpoLoading ? (
                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <SpinnerIcon /> Hľadám údaje v registri...
                  </span>
                ) : icoFetchSuccess ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                    <CheckIcon /> Údaje úspešne načítané, pokračujem...
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">Zadajte IČO pre automatické vyhľadanie</span>
                )}
              </div>
              <button onClick={() => setStep('form')} className="w-full py-3 px-6 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-all border border-transparent hover:border-blue-100 dark:hover:border-slate-600">
                Pokračovať bez IČO
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <ThemeSwitcher />
      <div className="fixed top-4 left-4 z-10">
         <button 
           onClick={() => {
             setFormData(initialFormData);
             setStep('welcome');
           }} 
           className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors" 
           title="Resetovať formulár a vrátiť sa na úvod"
         >
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
           </svg>
         </button>
      </div>
      <main className="container mx-auto px-4 py-8 pt-20 max-w-5xl">
        <form onSubmit={(e) => { e.preventDefault(); generateA1Xml(formData); }}>
          <FormSection title="1. Údaje o žiadateľovi">
            <InputField label="Titul pred menom" id="titulPred" name="titulPred" value={formData.titulPred} onChange={handleChange} suggestions={TITLES_BEFORE} />
            <InputField label="Meno" id="meno" name="meno" value={formData.meno} onChange={handleChange} required />
            <InputField label="Priezvisko" id="priezvisko" name="priezvisko" value={formData.priezvisko} onChange={handleChange} required />
            <InputField label="Rodné priezvisko" id="rodnePriezvisko" name="rodnePriezvisko" value={formData.rodnePriezvisko} onChange={handleChange} />
            <InputField label="Titul za menom" id="titulZa" name="titulZa" value={formData.titulZa} onChange={handleChange} suggestions={TITLES_AFTER} />
            <InputField label="Rodné číslo" id="rodneCislo" name="rodneCislo" value={formData.rodneCislo} onChange={handleChange} required />
            <InputField label="Dátum narodenia" id="datumNarodenia" name="datumNarodenia" type="date" value={formData.datumNarodenia} onChange={handleChange} required />
            <InputField label="Miesto narodenia" id="miestoNarodenia" name="miestoNarodenia" value={formData.miestoNarodenia} onChange={handleChange} />
            <SelectField label="Štát narodenia" id="statNarodenia" name="statNarodenia" value={formData.statNarodenia} onChange={handleChange} options={COUNTRIES} />
            <SelectField label="Štátna príslušnosť" id="statnaPrislusnost" name="statnaPrislusnost" value={formData.statnaPrislusnost} onChange={handleChange} options={COUNTRIES} />
            <SelectField label="Pohlavie" id="pohlavie" name="pohlavie" value={formData.pohlavie} onChange={handleChange} options={['Muž', 'Žena']} />
            <InputField label="E-mail" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <InputField label="Telefón" id="telefon" name="telefon" type="tel" value={formData.telefon} onChange={handleChange} required />
            <CheckboxField label="Mám pobytový preukaz v SR" id="pobytovyPreukaz" name="pobytovyPreukaz" checked={formData.pobytovyPreukaz} onChange={handleChange} />
            <div className="md:col-span-3 mt-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                 <h3 className="text-lg font-medium mb-4">Adresa trvalého pobytu</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AddressFields address={formData.adresaPobytu} namePrefix="adresaPobytu" onChange={handleChange} required />
                 </div>
            </div>
          </FormSection>

          <FormSection title="2. Podnikanie na Slovensku">
            <InputField label="IČO" id="ico" name="ico" inputMode="numeric" value={formData.ico} onChange={handleChange} required />
            <InputField label="Obchodné meno" id="obchodneMeno" name="obchodneMeno" value={formData.obchodneMeno} onChange={handleChange} required gridSpan="md:col-span-2" />
            <InputField label="Dátum začiatku činnosti" id="datumZaciatkuCinnosti" name="datumZaciatkuCinnosti" type="date" value={formData.datumZaciatkuCinnosti} onChange={handleChange} required />
            <SelectField label="SK NACE (Ekonomická činnosť)" id="skNace" name="skNace" value={formData.skNace} onChange={handleChange} options={NACE_CATEGORIES.map(n => n.name)} />
            
            <InputField 
                label="Popis činnosti na Slovensku" 
                id="cinnostSZCONaSlovensku" 
                name="cinnostSZCONaSlovensku" 
                type="textarea" 
                value={formData.cinnostSZCONaSlovensku} 
                onChange={handleChange} 
                required 
                gridSpan="md:col-span-3" 
                suggestions={formData.dostupneCinnosti}
                placeholder={formData.dostupneCinnosti && formData.dostupneCinnosti.length > 1 ? "Vyberte činnosť zo zoznamu (ikona vpravo hore) alebo vyplňte ručne..." : ""}
            />
            <div className="md:col-span-3 mt-4 p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-slate-800">
                <h3 className="text-lg font-medium mb-4">Adresa miesta podnikania</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AddressFields address={formData.adresaMiestaPodnikania} namePrefix="adresaMiestaPodnikania" onChange={handleChange} required />
                </div>
            </div>
          </FormSection>

          <FormSection title="3. Údaje o vyslaní a doručení">
            <InputField label="Začiatok vyslania" id="datumZaciatkuVyslania" name="datumZaciatkuVyslania" type="date" value={formData.datumZaciatkuVyslania} onChange={handleChange} required />
            <InputField label="Koniec vyslania" id="datumKoncaVyslania" name="datumKoncaVyslania" type="date" value={formData.datumKoncaVyslania} onChange={handleChange} required />
            <InputField label="Obchodné meno prijímajúcej osoby" id="obchodneMenoPrijimajucejOsoby" name="obchodneMenoPrijimajucejOsoby" value={formData.obchodneMenoPrijimajucejOsoby} onChange={handleChange} required gridSpan="md:col-span-3" />
            <div className="md:col-span-3 mt-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                 <h3 className="text-lg font-medium mb-4">Adresa v štáte vyslania</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SelectField label="Štát" id="statVyslania" name="statVyslania" value={formData.statVyslania} onChange={handleChange} required options={COUNTRIES} />
                    <AddressFields address={formData.adresaVyslania} namePrefix="adresaVyslania" onChange={handleChange} required showStat={false} />
                 </div>
            </div>
            <SelectField 
              label="Príslušná pobočka SP" 
              id="pobocka" 
              name="pobocka" 
              value={formData.pobocka} 
              onChange={handleChange} 
              options={BRANCH_OFFICES.map(b => b.name)} 
              values={BRANCH_OFFICES.map(b => b.code)}
            />
            <InputField label="Doplňujúce informácie" id="poznamka" name="poznamka" type="textarea" value={formData.poznamka} onChange={handleChange} gridSpan="md:col-span-2" />
          </FormSection>
          
          <div className="mt-12 flex justify-center pb-12">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95">
              Generovať a stiahnuť XML
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default App;
