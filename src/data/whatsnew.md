# What's New - Excel to Winfakt

## Versie Update - 24 Juni 2025

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