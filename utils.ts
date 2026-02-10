
import { FormDataState, Address } from './types';
import { COUNTRY_MAP, BRANCH_OFFICES, NACE_CATEGORIES } from './constants';

export const escapeXml = (unsafe: string): string => {
  if (typeof unsafe !== 'string') return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export const parseBirthDateFromRc = (rc: string): string | null => {
  const cleanRc = rc.replace(/\D/g, '');
  if (cleanRc.length < 6) return null;
  let monthPart = parseInt(cleanRc.substring(2, 4), 10);
  if (monthPart > 50) monthPart -= 50;
  const yearPart = parseInt(cleanRc.substring(0, 2), 10);
  const dayPart = parseInt(cleanRc.substring(4, 6), 10);
  const currentYear = new Date().getFullYear() % 100;
  const year = yearPart > currentYear ? 1900 + yearPart : 2000 + yearPart;
  return `${year}-${monthPart.toString().padStart(2, '0')}-${dayPart.toString().padStart(2, '0')}`;
};

const renderCodelist = (tagName: string, codelistCode: string, itemCode: string, itemName: string) => `
    <${tagName}>
      <Codelist>
        <CodelistCode>${codelistCode}</CodelistCode>
        <CodelistItem>
          <ItemCode>${itemCode}</ItemCode>
          <ItemName>${escapeXml(itemName)}</ItemName>
        </CodelistItem>
      </Codelist>
    </${tagName}>`;

const renderPhysicalAddress = (addr: Address) => `
    <PhysicalAddress>
      <Municipality>${escapeXml(addr.obec)}</Municipality>
      <StreetName>${escapeXml(addr.ulica)}</StreetName>
      <BuildingNumber>${escapeXml(addr.orientacneCislo)}</BuildingNumber>
      <PropertyRegistrationNumber>${escapeXml(addr.supisneCislo)}</PropertyRegistrationNumber>
      <DeliveryAddress>
        <PostalCode>${escapeXml(addr.psc.replace(/\s/g, ''))}</PostalCode>
      </DeliveryAddress>
      ${renderCodelist('Country', 'CL000086', COUNTRY_MAP[addr.stat] || '703', addr.stat)}
    </PhysicalAddress>`;

export const generateA1Xml = (formData: FormDataState): void => {
  const today = new Date().toISOString().split('T')[0];
  
  // Zistenie hlavného štátu vyslania
  const mainCountry = formData.miestaVyslania[0]?.adresa.stat || formData.statVyslania || 'Nemecko';

  // Logika pre získanie kódu a názvu pobočky (input môže byť kód 'BA' alebo názov 'Bratislava')
  const selectedBranch = BRANCH_OFFICES.find(b => b.name === formData.pobocka) || BRANCH_OFFICES.find(b => b.code === formData.pobocka);
  const branchCode = selectedBranch ? selectedBranch.code : (formData.pobocka || 'BA');
  const branchName = selectedBranch ? selectedBranch.name : 'Bratislava';

  // Logika pre SK NACE (input je zvyčajne názov z dropdownu)
  const selectedNace = NACE_CATEGORIES.find(n => n.name === formData.skNace);
  const naceCode = selectedNace ? selectedNace.code : '3';
  const naceName = selectedNace ? selectedNace.name : (formData.skNace || 'F – Stavebníctvo');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<ApplicationForTheIssueOfAPortableDocumentDueToSzcoPosting xmlns="http://schemas.gov.sk/form/30807484.Ziadost_o_vystavenie_prenosneho_dokumentu_A1_z_dovodu_vyslania_SZCO.sk.pda/12.0">
  <Applicant>
    <PersonData>
      <PhysicalPerson>
        <PersonName>
          <GivenName>${escapeXml(formData.meno)}</GivenName>
          <FamilyName>${escapeXml(formData.priezvisko)}</FamilyName>
          <GivenFamilyName>${escapeXml(formData.rodnePriezvisko || formData.priezvisko)}</GivenFamilyName>
          ${formData.titulPred ? `<Affix position="prefix"><Codelist><CodelistCode>CL000062</CodelistCode><CodelistItem><ItemCode>01</ItemCode><ItemName>${escapeXml(formData.titulPred)}</ItemName></CodelistItem></Codelist></Affix>` : ''}
          ${formData.titulZa ? `<Affix position="postfix"><NonCodelistData>${escapeXml(formData.titulZa)}</NonCodelistData></Affix>` : ''}
        </PersonName>
        <Birth>
          <DateOfBirth>${escapeXml(formData.datumNarodenia)}</DateOfBirth>
          <BirthPlace>${escapeXml(formData.miestoNarodenia || formData.adresaPobytu.obec)}</BirthPlace>
          ${renderCodelist('BirthCountry', 'CL000086', COUNTRY_MAP[formData.statNarodenia] || '703', formData.statNarodenia)}
        </Birth>
        ${renderCodelist('Nationality', 'CL010131', COUNTRY_MAP[formData.statnaPrislusnost] || '703', formData.statnaPrislusnost)}
        ${renderCodelist('Gender', 'CL003003', formData.pohlavie || '1', formData.pohlavie === '2' ? 'žena' : 'muž')}
      </PhysicalPerson>
      ${renderPhysicalAddress(formData.adresaPobytu)}
      <ID>
        ${renderCodelist('IdentifierType', 'CL004001', '9', 'Rodné číslo')}
        <IdentifierValue>${escapeXml(formData.rodneCislo.replace(/\//g, ''))}</IdentifierValue>
      </ID>
      <TelephoneAddress>
        <Number><FormattedNumber>${escapeXml(formData.telefon)}</FormattedNumber></Number>
      </TelephoneAddress>
      <ElectronicAddress>
        <InternetAddress><Address>mailto:${escapeXml(formData.email)}</Address></InternetAddress>
      </ElectronicAddress>
    </PersonData>
    <ResidencePermit>${formData.pobytovyPreukaz}</ResidencePermit>
  </Applicant>
  <Posting>
    <PersonData>
      <CorporateBody>
        <CorporateBodyFullName>${escapeXml(formData.obchodneMeno)}</CorporateBodyFullName>
      </CorporateBody>
      ${renderPhysicalAddress(formData.adresaMiestaPodnikania.ulica ? formData.adresaMiestaPodnikania : formData.adresaPobytu)}
      <ID>
        ${renderCodelist('IdentifierType', 'CL004001', '7', 'IČO (Identifikačné číslo organizácie)')}
        <IdentifierValue>${escapeXml(formData.ico)}</IdentifierValue>
      </ID>
    </PersonData>
    <SzcoDateStart>${escapeXml(formData.datumZaciatkuCinnosti)}</SzcoDateStart>
    <SZCO>
      <ActivityBeforeSending>${escapeXml(formData.cinnostSZCONaSlovensku)}</ActivityBeforeSending>
      <ActivityDuringSending>${escapeXml(formData.popisCinnosti)}</ActivityDuringSending>
      <EndingOfSending>true</EndingOfSending>
      <RetainingPremises>true</RetainingPremises>
    </SZCO>
    <Places>
      ${renderCodelist('Country', 'CL000086', COUNTRY_MAP[mainCountry] || '276', mainCountry)}
      ${formData.miestaVyslania.map(place => `
      <Place>
        <PersonData>
          <CorporateBody>
            <CorporateBodyFullName>${escapeXml(place.nazov)}</CorporateBodyFullName>
          </CorporateBody>
          ${renderPhysicalAddress(place.adresa)}
          <ID>
            ${renderCodelist('IdentifierType', 'CL004001', '7', 'IČO (Identifikačné číslo organizácie)')}
            <IdentifierValue>${escapeXml(place.ico || '00000000')}</IdentifierValue>
          </ID>
        </PersonData>
      </Place>`).join('')}
    </Places>
    <SendingDuration>
      <Start>${escapeXml(formData.datumZaciatkuVyslania)}</Start>
      <End>${escapeXml(formData.datumKoncaVyslania)}</End>
    </SendingDuration>
    ${renderCodelist('EconomicClassification', 'ICL001013', naceCode, naceName)}
    <DocumentIssued><Value>false</Value></DocumentIssued>
  </Posting>
  <OtherInformation>
    <OtherCountryIssue><Value>false</Value></OtherCountryIssue>
    <AdditionalInfo>${escapeXml(formData.poznamka)}</AdditionalInfo>
  </OtherInformation>
  <Date>${today}</Date>
  <Declaration>
    <TrueData>true</TrueData>
  </Declaration>
  ${renderCodelist('ContactBranchOffice', 'ICL001013', branchCode, branchName)}
  <IsForeigner>${formData.isForeigner}</IsForeigner>
</ApplicationForTheIssueOfAPortableDocumentDueToSzcoPosting>`.trim();

  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ziadost_a1_${formData.priezvisko.toLowerCase()}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
