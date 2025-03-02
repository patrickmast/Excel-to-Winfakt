interface ColumnGroup {
  name: string;
  columns: string[];
}

export function identifyColumnGroups(columns: string[]): ColumnGroup[] {
  const groups: ColumnGroup[] = [];

  // Add special case for Intrastat fields
  const intrastatFields = [
    "Intrastat, lidstaat van herkomst",
    "Intrastat, standaard gewest",
    "Intrastat, goederencode",
    "Intrastat, gewicht per eenheid",
    "Intrastat, land van oorsprong"
  ];
  
  // Check if any Intrastat fields are present in the columns
  const presentIntrastatFields = intrastatFields.filter(field => columns.includes(field));
  
  if (presentIntrastatFields.length > 0) {
    groups.push({
      name: "Intrastat",
      columns: presentIntrastatFields
    });
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
    // Skip columns that are already in the Intrastat group
    if (intrastatFields.includes(col)) {
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