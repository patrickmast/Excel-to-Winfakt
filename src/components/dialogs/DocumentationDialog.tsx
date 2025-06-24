import { PM7Dialog, PM7DialogContent, PM7DialogDescription, PM7DialogHeader, PM7DialogTitle } from 'pm7-ui-style-guide';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Settings, Database, Filter, Download, Upload, Code, X } from 'lucide-react';

interface DocumentationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentationDialog = ({ open, onOpenChange }: DocumentationDialogProps) => {
  return (
    <PM7Dialog open={open} onOpenChange={onOpenChange}>
      <PM7DialogContent className="!max-w-[750px]">
        <PM7DialogHeader className="flex-shrink-0 px-6 py-4 border-b relative">
          <PM7DialogTitle className="text-2xl pr-8">Excel naar Winfakt - Documentatie</PM7DialogTitle>
          <PM7DialogDescription className="text-muted-foreground">
            Uitgebreide handleiding en mogelijkheden
          </PM7DialogDescription>
        </PM7DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <div className="space-y-8">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Overzicht
                </CardTitle>
                <CardDescription>
                  Excel naar Winfakt is een krachtige tool voor het transformeren van verschillende bestandsformaten naar Winfakt-compatibele CSV bestanden.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Ondersteunde bestandsformaten:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>CSV bestanden</li>
                      <li>Excel (.xlsx) bestanden</li>
                      <li>Winfakt Classic (.soc) bestanden</li>
                      <li>DBF database bestanden (.dbf)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Hoofdfuncties:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Visuele kolom mapping</li>
                      <li>Data transformaties</li>
                      <li>Configuratie opslaan en delen</li>
                      <li>Realtime preview</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Bestanden Uploaden
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Drag & Drop Upload</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Sleep bestanden naar het upload gebied of klik om bestanden te selecteren.
                  </p>
                  <div className="bg-muted p-3 rounded text-sm">
                    <strong>Tip:</strong> De tool detecteert automatisch het bestandsformaat en toont de juiste kolommen.
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Excel Bestanden</h4>
                  <p className="text-sm text-muted-foreground">
                    Voor Excel bestanden kun je het gewenste werkblad selecteren via de dropdown boven de kolommen.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Bestandsgrootte Limiet</h4>
                  <p className="text-sm text-muted-foreground">
                    Maximum bestandsgrootte is 50MB. Grotere bestanden worden automatisch afgewezen.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Column Mapping */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Kolom Mapping
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Verbonden Kolommen</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Sleep kolommen van links (bronbestand) naar rechts (Winfakt velden) om verbindingen te maken.
                  </p>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      Verbonden kolom
                    </Badge>
                    <span className="text-sm text-muted-foreground">= Kolom is gekoppeld aan een Winfakt veld</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Kolom Sets</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Kies tussen verschillende doelformaten:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Artikelen:</strong> Voor product/artikel imports</li>
                    <li><strong>Klanten:</strong> Voor klanten/contacten imports</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Zoeken en Filteren</h4>
                  <p className="text-sm text-muted-foreground">
                    Gebruik de zoekbalken boven de kolommen om snel de juiste velden te vinden.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Transformations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Data Transformaties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Expression Editor</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Klik op het tandwiel icoon naast een verbonden kolom om transformaties toe te voegen.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Helper Functies</h4>
                  <p className="text-sm text-muted-foreground mb-2">Beschikbare functies:</p>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted p-2 rounded">
                      <code>UPPER(value)</code> - Naar hoofdletters
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <code>LOWER(value)</code> - Naar kleine letters
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <code>TRIM(value)</code> - Spaties weghalen
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <code>REPLACE(value, "oud", "nieuw")</code> - Tekst vervangen
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <code>IF(conditie, "ja", "nee")</code> - Voorwaardelijke waarde
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <code>CONCAT(val1, val2)</code> - Waarden samenvoegen
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded">
                  <h5 className="font-semibold text-blue-900 mb-1">Geavanceerde Expressies</h5>
                  <p className="text-sm text-blue-800 mb-2">
                    Je kunt complexe expressies maken door functies te combineren:
                  </p>
                  <code className="text-sm bg-blue-100 p-1 rounded">
                    UPPER(TRIM(REPLACE(value, ".", ",")))
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Filtering */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Data Filtering
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Filter Button</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Klik op de "Filter" knop om geavanceerde filters in te stellen.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Filter Types</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Bevat:</strong> Rijen waar kolom bepaalde tekst bevat</li>
                    <li><strong>Gelijk aan:</strong> Exacte match</li>
                    <li><strong>Niet gelijk aan:</strong> Alles behalve exacte match</li>
                    <li><strong>Groter dan / Kleiner dan:</strong> Voor numerieke vergelijkingen</li>
                    <li><strong>Leeg / Niet leeg:</strong> Voor het controleren van lege velden</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Gecombineerde Filters</h4>
                  <p className="text-sm text-muted-foreground">
                    Combineer meerdere filters met EN/OF logica voor complexe selecties.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuratie Beheer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Configuraties Opslaan</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Sla je mapping en transformatie instellingen op voor hergebruik:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Klik op het <strong>opslaan icoon</strong> naast de configuratie naam</li>
                    <li>Geef een naam op voor je configuratie</li>
                    <li>Configuraties worden gekoppeld aan het dossier nummer</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Configuraties Laden</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Via het menu kun je opgeslagen configuraties laden:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Laden:</strong> Kies uit lijst van opgeslagen configuraties</li>
                    <li><strong>Verwijderen:</strong> Verwijder oude configuraties</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">URL Delen</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Configuraties kunnen gedeeld worden via URL parameters:
                  </p>
                  <div className="bg-muted p-2 rounded text-sm font-mono">
                    ?dossier=12345&config=MijnConfiguratie
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded">
                  <h5 className="font-semibold text-green-900 mb-1">Nieuwe Configuratie</h5>
                  <p className="text-sm text-green-800">
                    Wanneer je geen configuratie geladen hebt, kun je direct opslaan via de groene badge "Geen configuratie geladen".
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export en Download
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">CSV Export</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Klik op "Exporteer CSV" om het getransformeerde bestand te downloaden.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Bestand wordt automatisch gedownload</li>
                    <li>Bestandsnaam bevat originele naam + "_transformed"</li>
                    <li>Encoding: UTF-8 met BOM voor Nederlandse tekens</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Preview Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Voor grote bestanden wordt een preview van de eerste 100 rijen getoond. De export bevat altijd alle data.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tips & Tricks */}
            <Card>
              <CardHeader>
                <CardTitle>Tips & Trucs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-yellow-50 p-3 rounded">
                  <h5 className="font-semibold text-yellow-900 mb-1">Performance Tip</h5>
                  <p className="text-sm text-yellow-800">
                    Voor bestanden groter dan 10MB wordt de verwerking in een Web Worker gedaan om de interface responsief te houden.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded">
                  <h5 className="font-semibold text-blue-900 mb-1">Keyboard Shortcuts</h5>
                  <ul className="text-sm text-blue-800 list-disc list-inside">
                    <li>Ctrl/Cmd + S: Configuratie opslaan</li>
                    <li>Ctrl/Cmd + O: Configuratie laden</li>
                    <li>Ctrl/Cmd + E: CSV exporteren</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-3 rounded">
                  <h5 className="font-semibold text-purple-900 mb-1">Data Validatie</h5>
                  <p className="text-sm text-purple-800">
                    De tool controleert automatisch op veelvoorkomende problemen zoals lege verplichte velden en ongeldige data types.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Troubleshooting */}
            <Card>
              <CardHeader>
                <CardTitle>Veelgestelde Vragen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-semibold mb-1">Mijn bestand wordt niet geaccepteerd</h5>
                  <p className="text-sm text-muted-foreground">
                    Controleer of het bestand een ondersteund formaat heeft (.csv, .xlsx, .soc, .dbf) en kleiner is dan 50MB.
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold mb-1">De verbonden kolommen verdwijnen niet na "Nieuw"</h5>
                  <p className="text-sm text-muted-foreground">
                    Dit was een bekende issue die is opgelost. Refresh de pagina als het probleem blijft bestaan.
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold mb-1">Mijn configuratie wordt niet geladen</h5>
                  <p className="text-sm text-muted-foreground">
                    Controleer of het dossier nummer correct is in de URL. Configuraties zijn gekoppeld aan specifieke dossiers.
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold mb-1">Expressies werken niet zoals verwacht</h5>
                  <p className="text-sm text-muted-foreground">
                    Controleer de syntax van je expressies. Gebruik dubbele aanhalingstekens voor tekst en let op hoofdletters in functienamen.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PM7DialogContent>
    </PM7Dialog>
  );
};

export default DocumentationDialog;