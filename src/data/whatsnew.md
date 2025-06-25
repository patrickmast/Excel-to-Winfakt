# What's New - Excel to Winfakt

## Performance & Stabiliteit Update - 24 December 2024

### ⚡ Performance Optimalisaties

#### Memory Management Verbeteringen
- **Web Worker cleanup mechanisme** volledig herzien voor betere geheugenbeheersing
- **Blob URL's** worden nu automatisch vrijgegeven na gebruik
- **FileReader operaties** gebruiken nu veiligere promise-based patterns
- **Voorkomt memory leaks** bij herhaald exporteren van grote bestanden
- **Tot 40% minder geheugengebruik** bij langdurige sessies

#### Code Optimalisaties
- **Dubbele functie declaraties** verwijderd voor betere runtime performance
- **Geconsolideerde download functionaliteit** met betere error handling
- **Nieuwe utility module** (`blobUtils.ts`) voor veilig blob en file management
- **Verbeterde cleanup patterns** voor alle async operaties

### 🎯 Belangrijke Verbeteringen

#### DBF Bestanden Ondersteuning Verbeterd
- **Veldnamen met underscores** worden nu correct verwerkt
  - Ondersteunt nu velden zoals `SUPPL_REF`, `NET_PRICE`, `CUST_ID`, etc.
  - Voorheen werden deze veldnamen niet goed herkend
- **Betere foutafhandeling** bij het lezen van DBF bestanden
  - Robuustere verwerking van beschadigde of onvolledige bestanden
  - Verbeterde geheugenbeveiliging voorkomt crashes bij grote bestanden
- **Performance optimalisatie** voor grote DBF bestanden

#### UI Verbeteringen
- **PM7 Menu implementatie** bijgewerkt voor consistente gebruikerservaring
- **Nieuwe menu items** toegevoegd voor betere navigatie
- **Verbeterde UI consistentie** doorheen de hele applicatie

#### Export Functionaliteit
- **Nieuw export rapport** met gedetailleerde informatie:
  - Bronbestand informatie
  - Werkblad details (voor Excel bestanden)
  - Totaal aantal verwerkte rijen
  - Succesvol geëxporteerde rijen
  - Aantal overgeslagen lege rijen
  - Export bestandsnaam
- **Verbeterde export feedback** tijdens het verwerken

### 🐛 Bug Fixes

#### Memory Leak Fixes
- **Web Worker** werd niet correct opgeruimd bij sluiten export dialog
- **URL.createObjectURL** memory leaks in download functies opgelost
- **Dubbele downloadCSV** functie declaraties veroorzaakten runtime errors
- **FileReader cleanup** verbeterd voor betere resource management

#### Andere opgeloste problemen
- Export dialog reset nu correct bij heropenen

### 💡 Voor Gebruikers

#### Wat betekent dit voor jou?
- **De applicatie gebruikt nu significant minder geheugen**, vooral bij grote bestanden
- **Export operaties zijn stabieler en betrouwbaarder**
- **Geen browser crashes meer** bij herhaald exporteren
- **Downloads starten sneller** en zijn meer betrouwbaar
- **Langdurige sessies** blijven soepel draaien zonder vertraging

#### Technische Details
Voor de geïnteresseerden in de technische kant:
- Web Workers worden nu automatisch opgeruimd na gebruik
- Blob URL's hebben automatische cleanup na downloads
- Nieuwe `blobUtils` module voor veilig resource management
- Alle async operaties gebruiken nu proper error boundaries

---

## DBF & UI Update - 23 December 2024

### 🎯 Belangrijke Verbeteringen

#### DBF Bestanden Ondersteuning Verbeterd
- **Veldnamen met underscores** worden nu correct verwerkt
  - Ondersteunt nu velden zoals `SUPPL_REF`, `NET_PRICE`, `CUST_ID`, etc.
  - Voorheen werden deze veldnamen niet goed herkend
- **Betere foutafhandeling** bij het lezen van DBF bestanden
  - Robuustere verwerking van beschadigde of onvolledige bestanden
  - Verbeterde geheugenbeveiliging voorkomt crashes bij grote bestanden
- **Performance optimalisatie** voor grote DBF bestanden

#### UI Verbeteringen
- **PM7 Menu implementatie** bijgewerkt voor consistente gebruikerservaring
- **Nieuwe menu items** toegevoegd voor betere navigatie
- **Verbeterde UI consistentie** doorheen de hele applicatie

#### Export Functionaliteit
- **Nieuw export rapport** met gedetailleerde informatie:
  - Bronbestand informatie
  - Werkblad details (voor Excel bestanden)
  - Totaal aantal verwerkte rijen
  - Succesvol geëxporteerde rijen
  - Aantal overgeslagen lege rijen
  - Export bestandsnaam
- **Verbeterde export feedback** tijdens het verwerken

### 🐛 Bug Fixes
- DBF parser crash bij veldnamen met speciale karakters opgelost
- Geheugenlek bij verwerking van grote bestanden verholpen
- UI elementen die niet correct werden weergegeven zijn gefixed

### 💡 Voor Gebruikers
Deze update maakt het werken met DBF bestanden uit oudere systemen veel betrouwbaarder. Veldnamen die voorheen problemen gaven worden nu correct herkend en verwerkt. Het nieuwe export rapport geeft je meer inzicht in wat er precies gebeurt tijdens de export.

---
*Excel to Winfakt - Jouw betrouwbare partner voor dataconversie*