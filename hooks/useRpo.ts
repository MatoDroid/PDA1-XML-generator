
// Import React to fix namespace errors
import React, { useState, useEffect } from 'react';
import { FormDataState, Address } from '../types';
import { BRANCH_OFFICE_BY_PSC } from '../psc_mapping';

// Fix: Address type properties must match the interface (supisneCislo, orientacneCislo instead of cislo)
const emptyAddress: Address = { ulica: '', supisneCislo: '', orientacneCislo: '', obec: '', psc: '', stat: 'Slovenská republika' };

export const useRpo = (ico: string, setFormData: React.Dispatch<React.SetStateAction<FormDataState>>) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const cleanIco = ico.trim().replace(/\s/g, '');
        
        const handler = setTimeout(async () => {
            if (!cleanIco) {
                setError(null);
                setSuccess(false);
                setLoading(false);
                return;
            }

            if (!/^\d{8}$/.test(cleanIco)) {
                setError('IČO musí mať 8 číslic.');
                setSuccess(false);
                setLoading(false);
                return;
            }

            setError(null);
            setLoading(true);
            setSuccess(false);
            console.log(`[RPO Debug] Starting search for ICO: ${cleanIco}`);

            try {
                // 1. Vyhľadanie organizácie podľa IČO (cez lokálny proxy server)
                const searchApiUrl = `/api/rpo/search?identifier=${cleanIco}`;
                console.log(`[RPO Debug] Search URL (local proxy): ${searchApiUrl}`);

                const searchResponse = await fetch(searchApiUrl);

                if (!searchResponse.ok) {
                    const errorData = await searchResponse.json().catch(() => ({}));
                    console.error(`[RPO Debug] Search failed:`, errorData);
                    throw new Error(`Chyba RPO: ${errorData.details || errorData.error || searchResponse.statusText} (${searchResponse.status})`);
                }

                const searchData = await searchResponse.json();
                console.log('[RPO Debug] Search Data:', searchData);
                const results = searchData.results || [];
                const entitySummary = results[0];

                if (!entitySummary || !entitySummary.id) {
                    console.warn(`[RPO Debug] No entity found for ICO: ${cleanIco}`);
                    throw new Error('Organizácia s týmto IČO nebola nájdená.');
                }

                // 2. Získanie detailu organizácie (cez lokálny proxy server)
                const detailApiUrl = `/api/rpo/detail/${entitySummary.id}`;
                console.log(`[RPO Debug] Detail URL (local proxy): ${detailApiUrl}`);

                const detailResponse = await fetch(detailApiUrl);

                if (!detailResponse.ok) {
                    const errorData = await detailResponse.json().catch(() => ({}));
                    console.error(`[RPO Debug] Detail fetch failed:`, errorData);
                    throw new Error(`Chyba RPO detail: ${errorData.details || errorData.error || detailResponse.statusText} (${detailResponse.status})`);
                }

                const entity = await detailResponse.json();
                console.log('[RPO Debug] Entity Detail Data:', entity);

                // --- Mapovanie dát podľa štruktúry v1 ---
                const obchodneMeno = entity.fullNames?.[0]?.value || '';
                const datumZaciatkuCinnosti = entity.establishment || '';

                // Extract economic activities
                // Filter: has validFrom, no validTo (or validTo is null/empty)
                const activities = entity.activities || [];
                const activeActivities = Array.isArray(activities) 
                    ? activities
                        .filter((a: any) => a.economicActivityDescription && a.validFrom && !a.validTo)
                        .map((a: any) => a.economicActivityDescription)
                    : [];

                const addr = entity.addresses?.[0];
                // Fix: Map RPO address fields to Address interface properties
                const adresaMiestaPodnikania: Address = addr ? {
                    ulica: addr.street || '',
                    supisneCislo: addr.regNumber?.toString() || '',
                    orientacneCislo: addr.buildingNumber?.toString() || '',
                    obec: addr.municipality?.value || '',
                    psc: addr.postalCodes?.[0] || '',
                    stat: addr.country?.value || 'Slovenská republika',
                } : { ...emptyAddress };

                setFormData(prev => {
                    const newState = { ...prev };
                    newState.obchodneMeno = obchodneMeno;
                    newState.datumZaciatkuCinnosti = datumZaciatkuCinnosti;
                    newState.dostupneCinnosti = activeActivities;
                    
                    // Pre-fill only if exactly one activity is found and field is empty
                    if (activeActivities.length === 1 && !newState.cinnostSZCONaSlovensku) {
                        newState.cinnostSZCONaSlovensku = activeActivities[0];
                    }
                    
                    newState.adresaMiestaPodnikania = adresaMiestaPodnikania;
                    newState.zadatAdresuMiestaPodnikania = !!addr;

                    // Extrakcia údajov o fyzickej osobe (štatutár/podnikateľ)
                    const statutory = entity.statutoryBodies?.[0];
                    if (statutory && statutory.personName) {
                        const pn = statutory.personName;
                        newState.meno = pn.givenNames?.[0] || newState.meno;
                        newState.priezvisko = pn.familyNames?.[0] || newState.priezvisko;
                        newState.rodnePriezvisko = pn.givenFamilyNames?.[0] || newState.rodnePriezvisko;
                        
                        // Adresa trvalého pobytu štatutára
                        if (statutory.address) {
                            const sa = statutory.address;
                            // Fix: Map RPO address fields to Address interface properties
                            newState.adresaPobytu = {
                                ulica: sa.street || '',
                                supisneCislo: sa.regNumber?.toString() || '',
                                orientacneCislo: sa.buildingNumber?.toString() || '',
                                obec: sa.municipality?.value || '',
                                psc: sa.postalCodes?.[0] || '',
                                stat: sa.country?.value || 'Slovenská republika',
                            };
                            
                            // Auto-select branch based on PSC
                            if (newState.adresaPobytu.psc) {
                                const cleanPsc = newState.adresaPobytu.psc.replace(/\s/g, '');
                                const branchCode = BRANCH_OFFICE_BY_PSC[cleanPsc];
                                if (branchCode) {
                                    newState.pobocka = branchCode;
                                }
                            }
                        }
                    }

                    return newState;
                });

                setSuccess(true);
                setTimeout(() => setSuccess(false), 2000);
            } catch (err) {
                console.error('RPO Fetch Error:', err);
                setError(err instanceof Error ? err.message : 'Chyba pri získavaní údajov.');
            } finally {
                setLoading(false);
            }
        }, 600); 

        return () => clearTimeout(handler);
    }, [ico, setFormData]);

    return { loading, error, success };
};
