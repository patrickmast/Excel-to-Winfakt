interface ColumnGroup {
  name: string;
  columns: string[];
}

export function identifyColumnGroups(columns: string[]): ColumnGroup[] {
  // This array will store the groups in the exact order they should appear in the UI
  const groups: ColumnGroup[] = [];

  // Define all the special case fields
  // Intrastat fields (should appear last)
  const intrastatFields = [
    "Intrastat, lidstaat van herkomst",
    "Intrastat, standaard gewest",
    "Intrastat, goederencode",
    "Intrastat, gewicht per eenheid",
    "Intrastat, land van oorsprong"
  ];
  
  // Taxen fields (should appear after BTW-percentage)
  const taxenFields = [
    "Recupel",
    "Auvibel",
    "Bebat",
    "Reprobel",
    "Accijnzen",
    "Ecoboni"
  ];
  
  // Stock fields (should appear after Hoofdgroep and Subgroep)
  const stockFields = [
    "Stock verwerken?",
    "Minimum voorraad (ja/nee)",
    "Minimum voorraad (aantal)",
    "Minimum bestelhoeveelheid"
  ];
  
  // Stock aantallen aanpassen fields (should appear after Stock fields)
  const stockAantallenFields = [
    "Is beginstock"
  ];
  
  // Add special case for language description fields
  const languageDescriptionFields = [
    "Omschrijving NL",
    "Omschrijving GB",
    "Omschrijving DE",
    "Omschrijving FR",
    "Omschrijving TR"
  ];
  
  // Add special case for Netto verkoopprijs fields
  // We want to exclude Netto verkoopprijs 1 from the group
  const nettoVerkoopprijsFields = [
    "Netto verkoopprijs 2",
    "Netto verkoopprijs 3",
    "Netto verkoopprijs 4",
    "Netto verkoopprijs 5",
    "Netto verkoopprijs 6",
    "Netto verkoopprijs 7",
    "Netto verkoopprijs 8",
    "Netto verkoopprijs 9",
    "Netto verkoopprijs 10"
  ];
  
  // Add Voorraad locatie fields to stockAantallenFields
  for (let i = 1; i <= 9; i++) {
    stockAantallenFields.push(`Voorraad locatie ${i}`);
    stockAantallenFields.push(`Voorraad locatie ${i} toevoegen`);
  }
  
  // We'll create a mapping of group names to their columns
  // This allows us to define the exact order in which groups should appear
  
  // First, prepare all the groups that might be present
  const presentTaxenFields = taxenFields.filter(field => columns.includes(field));
  const presentStockFields = stockFields.filter(field => columns.includes(field));
  const presentStockAantallenFields = stockAantallenFields.filter(field => columns.includes(field));
  const presentLanguageDescriptionFields = languageDescriptionFields.filter(field => columns.includes(field));
  const presentNettoVerkoopprijsFields = nettoVerkoopprijsFields.filter(field => columns.includes(field));
  const presentIntrastatFields = intrastatFields.filter(field => columns.includes(field));
  
  // Define the order of groups as specified by the user
  const groupOrder = [
    // These are individual columns, not groups
    // "Artikelnummer", "Omschrijving", "Catalogusprijs", "Netto aankoopprijs", "Netto verkoopprijs 1", "BTW-percentage",
    
    // Groups in specified order
    { name: "Taxen", columns: presentTaxenFields },
    // "Leeggoed" is an individual column
    // "Eenheid", "Barcode", "Leveranciersnummer", "Artikelnummer fabrikant", "Artikelnummer leverancier", "Hoofdgroep", "Subgroep" are individual columns
    { name: "Stock", columns: presentStockFields },
    { name: "Stock aantallen aanpassen", columns: presentStockAantallenFields },
    // "Actief?", "Korting uitgeschakeld" are individual columns
    { name: "Omschrijvingen in andere talen", columns: presentLanguageDescriptionFields },
    { name: "Netto verkoopprijs 2 → 10", columns: presentNettoVerkoopprijsFields },
    // The rest are automatically generated groups or individual columns
    // "Intrastat" should be last
    { name: "Intrastat", columns: presentIntrastatFields }
  ];
  
  // Add groups in the specified order, but only if they have columns
  for (const group of groupOrder) {
    if (group.columns.length > 0) {
      groups.push({
        name: group.name,
        columns: group.columns
      });
    }
  }

  // Helper to check if a set of columns forms a numbered sequence
  const isNumberedSequence = (cols: string[]): boolean => {
    // Extract number and surrounding text pattern
    const firstCol = cols[0];
    const match = firstCol.match(/^(.*?)(\d+)(.*?)$/);
    if (!match) return false;

    const [_, prefix, firstNum, suffix] = match;

    // Verify all columns follow the same pattern with sequential numbers
    let lastNum = parseInt(firstNum);

    for (let i = 1; i < cols.length; i++) {
      const nextMatch = cols[i].match(/^(.*?)(\d+)(.*?)$/);
      if (!nextMatch) return false;

      const [__, nextPrefix, nextNum, nextSuffix] = nextMatch;

      // Check if prefix and suffix match and number is sequential
      if (nextPrefix !== prefix || nextSuffix !== suffix ||
          parseInt(nextNum) !== lastNum + 1) {
        return false;
      }

      lastNum = parseInt(nextNum);
    }

    return true;
  };

  // Find potential groups
  const potentialGroups = new Map<string, string[]>();

  columns.forEach(col => {
    // Skip columns that are already in the special groups
    if (intrastatFields.includes(col) || taxenFields.includes(col) || 
        stockFields.includes(col) || stockAantallenFields.includes(col) ||
        languageDescriptionFields.includes(col) || nettoVerkoopprijsFields.includes(col) ||
        col === "Netto verkoopprijs 1") {
      return;
    }
    
    const match = col.match(/^(.*?)(\d+)(.*?)$/);
    if (match) {
      const [_, prefix, num, suffix] = match;
      const key = `${prefix}#${suffix}`;
      if (!potentialGroups.has(key)) {
        potentialGroups.set(key, []);
      }
      potentialGroups.get(key)!.push(col);
    }
  });

  // Convert valid sequences into groups
  potentialGroups.forEach((cols, key) => {
    // Sort columns by their number
    cols.sort((a, b) => {
      const aNum = parseInt(a.match(/\d+/)![0]);
      const bNum = parseInt(b.match(/\d+/)![0]);
      return aNum - bNum;
    });

    if (cols.length > 2 && isNumberedSequence(cols)) {
      const firstMatch = cols[0].match(/^(.*?)(\d+)(.*?)$/)!;
      const lastMatch = cols[cols.length - 1].match(/^(.*?)(\d+)(.*?)$/)!;
      const [_, prefix, firstNum, suffix] = firstMatch;
      const lastNum = lastMatch[2];

      groups.push({
        name: `${prefix}${firstNum} → ${lastNum}${suffix}`,
        columns: cols
      });
    }
  });

  return groups;
}