
// Import React to fix namespace errors
import React, { useState, useEffect } from 'react';
import { FormDataState, Address } from '../types';

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

            try {
                // 1. Vyhľadanie organizácie podľa IČO
                const searchApiUrl = `https://api.statistics.sk/rpo/v1/search?identifier=${cleanIco}`;
                const proxySearchUrl = `https://corsproxy.io/?${encodeURIComponent(searchApiUrl)}`;

                const searchResponse = await fetch(proxySearchUrl, {
                    headers: { 'Accept': 'application/json' }
                });

                if (!searchResponse.ok) throw new Error('Nepodarilo sa spojiť s RPO vyhľadávaním.');

                const searchData = await searchResponse.json();
                const results = searchData.results || [];
                const entitySummary = results[0];

                if (!entitySummary || !entitySummary.id) {
                    throw new Error('Organizácia s týmto IČO nebola nájdená.');
                }

                // 2. Získanie detailu organizácie (obsahuje štatutárov a presné mená)
                const detailApiUrl = `https://api.statistics.sk/rpo/v1/entity/${entitySummary.id}?showHistoricalData=true&showOrganizationUnits=true`;
                const proxyDetailUrl = `https://corsproxy.io/?${encodeURIComponent(detailApiUrl)}`;

                const detailResponse = await fetch(proxyDetailUrl, {
                    headers: { 'Accept': 'application/json' }
                });

                if (!detailResponse.ok) throw new Error('Nepodarilo sa stiahnuť detail organizácie.');

                const entity = await detailResponse.json();

                // --- Mapovanie dát podľa štruktúry v1 ---
                const obchodneMeno = entity.fullNames?.[0]?.value || '';
                const datumZaciatkuCinnosti = entity.establishment || '';

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
