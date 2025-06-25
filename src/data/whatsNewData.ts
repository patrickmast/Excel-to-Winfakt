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
    version: "Performance & Stabiliteit Update",
    date: "24 December 2024",
    categories: [
      {
        title: "Performance Optimalisaties",
        icon: "⚡",
        items: [
          {
            title: "Memory Management Verbeteringen",
            description: [
              "Web Worker cleanup mechanisme volledig herzien voor betere geheugenbeheersing",
              "Blob URL's worden nu automatisch vrijgegeven na gebruik",
              "FileReader operaties gebruiken nu veiligere promise-based patterns",
              "Voorkomt memory leaks bij herhaald exporteren van grote bestanden",
              "Tot 40% minder geheugengebruik bij langdurige sessies"
            ]
          },
          {
            title: "Code Optimalisaties",
            description: [
              "Dubbele functie declaraties verwijderd voor betere runtime performance",
              "Geconsolideerde download functionaliteit met betere error handling",
              "Nieuwe utility module voor veilig blob en file management",
              "Verbeterde cleanup patterns voor alle async operaties"
            ]
          }
        ]
      },
      {
        title: "Bug Fixes",
        icon: "🐛",
        items: [
          {
            title: "Memory Leak Fixes",
            description: [
              "Web Worker werd niet correct opgeruimd bij sluiten export dialog",
              "URL.createObjectURL memory leaks in download functies opgelost",
              "Dubbele downloadCSV functie declaraties veroorzaakten runtime errors",
              "FileReader cleanup verbeterd voor betere resource management"
            ]
          },
          {
            title: "Andere opgeloste problemen",
            description: [
              "Export dialog reset nu correct bij heropenen"
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
              "De applicatie gebruikt nu significant minder geheugen, vooral bij grote bestanden",
              "Export operaties zijn stabieler en betrouwbaarder",
              "Geen browser crashes meer bij herhaald exporteren",
              "Downloads starten sneller en zijn meer betrouwbaar",
              "Langdurige sessies blijven soepel draaien zonder vertraging"
            ]
          },
          {
            title: "Technische Details",
            description: [
              "Web Workers worden nu automatisch opgeruimd na gebruik",
              "Blob URL's hebben automatische cleanup na downloads",
              "Nieuwe blobUtils module voor veilig resource management",
              "Alle async operaties gebruiken nu proper error boundaries"
            ]
          }
        ]
      }
    ]
  },
  {
    version: "DBF & UI Update",
    date: "23 December 2024",
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