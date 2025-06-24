export interface WhatsNewItem {
  version: string;
  date: string;
  categories: {
    title: string;
    icon?: string;
    items: {
      title: string;
      description: string[];
    }[];
  }[];
}

export const whatsNewData: WhatsNewItem[] = [
  {
    version: "Versie Update",
    date: "24 Juni 2025",
    categories: [
      {
        title: "Belangrijke Verbeteringen",
        icon: "🎯",
        items: [
          {
            title: "DBF Bestanden Ondersteuning Verbeterd",
            description: [
              "Veldnamen met underscores worden nu correct verwerkt (bijv. SUPPL_REF, NET_PRICE, CUST_ID)",
              "Betere foutafhandeling bij het lezen van DBF bestanden",
              "Robuustere verwerking van beschadigde of onvolledige bestanden",
              "Verbeterde geheugenbeveiliging voorkomt crashes bij grote bestanden",
              "Performance optimalisatie voor grote DBF bestanden"
            ]
          },
          {
            title: "UI Verbeteringen",
            description: [
              "PM7 Menu implementatie bijgewerkt voor consistente gebruikerservaring",
              "Nieuwe menu items toegevoegd voor betere navigatie",
              "Verbeterde UI consistentie doorheen de hele applicatie"
            ]
          },
          {
            title: "Export Functionaliteit",
            description: [
              "Nieuw export rapport met gedetailleerde informatie",
              "Bronbestand informatie en werkblad details",
              "Statistieken over verwerkte en overgeslagen rijen",
              "Verbeterde export feedback tijdens het verwerken"
            ]
          }
        ]
      },
      {
        title: "Bug Fixes",
        icon: "🐛",
        items: [
          {
            title: "Opgeloste problemen",
            description: [
              "DBF parser crash bij veldnamen met speciale karakters opgelost",
              "Geheugenlek bij verwerking van grote bestanden verholpen",
              "UI elementen die niet correct werden weergegeven zijn gefixed"
            ]
          }
        ]
      },
      {
        title: "Voor Gebruikers",
        icon: "💡",
        items: [
          {
            title: "Wat betekent dit voor jou?",
            description: [
              "Het werken met DBF bestanden uit oudere systemen is veel betrouwbaarder",
              "Veldnamen die voorheen problemen gaven worden nu correct herkend",
              "Het nieuwe export rapport geeft meer inzicht in de export"
            ]
          }
        ]
      }
    ]
  }
];