// Updated to add i18n translations
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ColumnMapper from '../components/ColumnMapper';
import { showToast } from '@/components/ui/SimpleToast';
import { useUrlParams } from '@/hooks/use-url-params';
import { useConfigurationApi } from '@/hooks/use-configuration-api';
import InfoDialog from '@/components/column-mapper/InfoDialog';
import LogDialog from '@/components/column-mapper/LogDialog';
import { ConfigurationSettings } from '@/components/column-mapper/types';
import PageHeader from './index/PageHeader';
import { useMappingReducer } from '@/hooks/use-mapping-reducer';
import NewConfirmDialog from '@/components/dialogs/NewConfirmDialog';
import SaveConfigDialog from '@/components/dialogs/SaveConfigDialog';
import LoadConfigDialog from '@/components/dialogs/LoadConfigDialog';
import DeleteConfigDialog from '@/components/dialogs/DeleteConfigDialog';
import UnsavedChangesDialog from '@/components/dialogs/UnsavedChangesDialog';

const Index = () => {
  const {
    state: mappingState,
    loadConfiguration,
    setMapping,
    setSourceData,
    resetState,
    updateTransforms,
    setFilter,
    setColumnOrder,
    markConfigurationSaved,
    incrementConnectionCounter,
    hasUnsavedChanges
  } = useMappingReducer();

  const [activeColumnSet, setActiveColumnSet] = useState<'artikelen' | 'klanten'>('artikelen');
  const { dossier, config, updateConfig, clearConfig } = useUrlParams();
  const { isLoading: isConfigLoading, loadConfig, saveConfig } = useConfigurationApi();
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [showSaveConfigDialog, setShowSaveConfigDialog] = useState(false);
  const [showLoadConfigDialog, setShowLoadConfigDialog] = useState(false);
  const [showDeleteConfigDialog, setShowDeleteConfigDialog] = useState(false);
  const [latestReport, setLatestReport] = useState<string | null>(null);
  const [exportData, setExportData] = useState<any[] | null>(null);
  const [sourceFileInfo, setSourceFileInfo] = useState<{ filename: string; rowCount: number; worksheetName?: string; size?: number } | null>(null);
  const [shouldResetMapper, setShouldResetMapper] = useState(false);
  const [showNewConfirmDialog, setShowNewConfirmDialog] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [isLoadingConfigFromUrl, setIsLoadingConfigFromUrl] = useState(!!config);
  const lastLoadedConfig = useRef<string | null>(null);
  const errorToastShown = useRef<string | null>(null);
  
  const { t } = useTranslation();

  // Use refs to maintain stable references to avoid useEffect dependency loops
  const loadConfigRef = useRef<typeof loadConfig>(loadConfig);
  const loadConfigurationRef = useRef<typeof loadConfiguration>(loadConfiguration);
  const setShouldResetMapperRef = useRef<typeof setShouldResetMapper>(setShouldResetMapper);
  
  // Update refs on each render but don't cause re-renders
  loadConfigRef.current = loadConfig;
  loadConfigurationRef.current = loadConfiguration;
  setShouldResetMapperRef.current = setShouldResetMapper;

  const handleLoadConfigurationFromUrl = useCallback(async (configName: string) => {
    // Prevent loading the same config multiple times
    if (lastLoadedConfig.current === configName) {
      return;
    }

    setIsLoadingConfigFromUrl(true);
    try {
      const loadedConfig = await loadConfigRef.current(configName);
      
      if (loadedConfig) {
        lastLoadedConfig.current = configName;
        const settings = loadedConfig.configuration_data as unknown as ConfigurationSettings;

        // Load all state properties in a single atomic update
        loadConfigurationRef.current(settings);

        // Update source file info if available
        if (settings.sourceColumns) {
          setSourceFileInfo({
            filename: settings.sourceFilename || '',
            rowCount: settings.sourceData?.length || 0,
            worksheetName: settings.worksheetName
          });
        }

        // Trigger UI refresh to update Connected columns and other components
        setShouldResetMapperRef.current(true);
      } else {
        // Configuration not found - show error toast once and clear from URL
        if (errorToastShown.current !== configName) {
          showToast({
            title: "Configuratie niet gevonden",
            description: `Configuratie "${configName}" bestaat niet voor dossier ${dossier}.`,
            variant: "destructive",
          });
          errorToastShown.current = configName;
        }
        lastLoadedConfig.current = null;
        clearConfig();
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      // Error toast is already handled in the loadConfig hook for network/API errors
      lastLoadedConfig.current = null;
      clearConfig();
    } finally {
      setIsLoadingConfigFromUrl(false);
    }
  }, [dossier, clearConfig]);

  useEffect(() => {
    if (config) {
      // Set loading state immediately when we detect a config parameter on mount
      if (lastLoadedConfig.current !== config) {
        setIsLoadingConfigFromUrl(true);
      }
      handleLoadConfigurationFromUrl(config);
    }
  }, [config, handleLoadConfigurationFromUrl]);

  const handleMappingChange = (mapping: Record<string, string>) => {
    setMapping(mapping);
    
    // Update columnOrder: add new keys that aren't in the current order, remove deleted ones
    const newKeys = Object.keys(mapping).filter(key => mapping[key] !== '');
    const currentOrder = mappingState.columnOrder || [];
    
    // Keep existing order for keys that are still mapped, add new keys at the end
    const updatedOrder = [
      ...currentOrder.filter(key => newKeys.includes(key)),
      ...newKeys.filter(key => !currentOrder.includes(key))
    ];
    
    setColumnOrder(updatedOrder);
  };

  // New handlers for the new configuration system
  const handleNew = () => {
    // Check if there are unsaved changes
    if (hasUnsavedChanges && config) {
      // Show unsaved changes dialog first
      setShowUnsavedChangesDialog(true);
    } else {
      // No unsaved changes or no config loaded, show new config dialog
      setShowNewConfirmDialog(true);
    }
  };

  const handleUnsavedChangesSave = () => {
    // Save current configuration first
    handleDirectSave();
    // Then show new config dialog
    setShowNewConfirmDialog(true);
  };

  const handleUnsavedChangesDiscard = () => {
    // Discard changes and show new config dialog
    setShowNewConfirmDialog(true);
  };

  const handleSave = () => {
    setShowSaveConfigDialog(true);
  };

  const handleDirectSave = async () => {
    // If no configuration loaded, show the save dialog to ask for a name
    if (!config) {
      setShowSaveConfigDialog(true);
      return;
    }

    // If there's already a configuration loaded, save directly
    // Create configuration data from current state
    const configurationData = {
      mapping: mappingState.mapping,
      columnTransforms: mappingState.columnTransforms,
      activeFilter: mappingState.activeFilter,
      sourceColumns: mappingState.sourceColumns,
      sourceData: mappingState.sourceData,
      sourceFilename: mappingState.sourceFilename,
      worksheetName: mappingState.worksheetName,
      columnOrder: mappingState.columnOrder,
      connectionCounter: mappingState.connectionCounter,
      sourceSearch: mappingState.sourceSearch,
      targetSearch: mappingState.targetSearch
    };

    try {
      await saveConfig(config, configurationData);
      // Mark the configuration as saved to update the indicator
      markConfigurationSaved();
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  };

  const handleLoad = () => {
    setShowLoadConfigDialog(true);
  };

  const handleDelete = () => {
    setShowDeleteConfigDialog(true);
  };

  const handleConfigurationSaved = (configName: string) => {
    // Update URL to reflect the saved configuration
    updateConfig(configName);
    // Update the ref to prevent reload loop
    lastLoadedConfig.current = configName;
    // Mark the configuration as saved to update the indicator
    markConfigurationSaved();
  };

  const handleConfigurationLoaded = (configName: string, configData: any) => {
    const settings = configData as ConfigurationSettings;
    
    // Load all state properties in a single atomic update
    loadConfiguration(settings);

    // Update source file info if available
    if (settings.sourceColumns) {
      setSourceFileInfo({
        filename: settings.sourceFilename || '',
        rowCount: settings.sourceData?.length || 0,
        worksheetName: settings.worksheetName
      });
    }

    // Update URL to reflect the loaded configuration
    updateConfig(configName);
    // Update the ref to prevent reload loop
    lastLoadedConfig.current = configName;

    // Trigger UI refresh to update Connected columns and other components
    setShouldResetMapper(true);
  };

  const handleConfirmNew = useCallback(() => {
    // Reset all state
    resetState();
    setSourceFileInfo(null);
    setShouldResetMapper(true);
    clearConfig(); // Clear URL parameter
  }, [resetState, clearConfig]);

  // Reset the flag immediately after render to prevent flickering
  useEffect(() => {
    if (shouldResetMapper) {
      setShouldResetMapper(false);
    }
  }, [shouldResetMapper]);

  const handleDisconnect = (uniqueKey: string) => {
    const newMapping = { ...mappingState.mapping };
    delete newMapping[uniqueKey];
    setMapping(newMapping);
    
    // Also remove from columnOrder
    const newColumnOrder = (mappingState.columnOrder || []).filter(key => key !== uniqueKey);
    setColumnOrder(newColumnOrder);
  };

  const handleReorder = (newOrder: [string, string, string][]) => {
    const newMapping: Record<string, string> = {};
    const newColumnOrder: string[] = [];
    newOrder.forEach(([key, _, target]) => {
      newMapping[key] = target;
      newColumnOrder.push(key);
    });
    setMapping(newMapping);
    setColumnOrder(newColumnOrder);
  };

  const handleExport = useCallback(async (data: any[], sourceFilename: string) => {
    if (!sourceFilename) {
      return;
    }
    
    // Show the log dialog immediately
    setShowLogDialog(true);
    
    // Pass the data to LogDialog for processing
    setExportData(data);
  }, []);

  const handleExportComplete = useCallback((report: string, exportedData: any[]) => {
    setLatestReport(report);
  }, []);

  const handleUpdateTransform = (uniqueKey: string, code: string) => {
    updateTransforms({
      ...mappingState.columnTransforms,
      [uniqueKey]: code
    });
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* New configuration dialogs */}
      <SaveConfigDialog
        open={showSaveConfigDialog}
        onOpenChange={setShowSaveConfigDialog}
        configurationData={{
          mapping: mappingState.mapping,
          columnTransforms: mappingState.columnTransforms,
          sourceColumns: mappingState.sourceColumns,
          sourceData: mappingState.sourceData,
          connectionCounter: mappingState.connectionCounter,
          sourceFilename: mappingState.sourceFilename,
          selectedSourceColumn: mappingState.selectedSourceColumn,
          selectedTargetColumn: mappingState.selectedTargetColumn,
          sourceSearch: mappingState.sourceSearch,
          targetSearch: mappingState.targetSearch,
          activeFilter: mappingState.activeFilter,
          columnOrder: mappingState.columnOrder
        }}
        onConfigurationSaved={handleConfigurationSaved}
        currentConfigName={config}
      />

      <LoadConfigDialog
        open={showLoadConfigDialog}
        onOpenChange={setShowLoadConfigDialog}
        onConfigurationLoaded={handleConfigurationLoaded}
      />

      <DeleteConfigDialog
        open={showDeleteConfigDialog}
        onOpenChange={setShowDeleteConfigDialog}
      />

      <InfoDialog
        open={showInfoDialog}
        onOpenChange={setShowInfoDialog}
        sourceFileInfo={sourceFileInfo}
      />

      <LogDialog
        open={showLogDialog}
        onOpenChange={setShowLogDialog}
        data={exportData}
        sourceFilename={mappingState.sourceFilename}
        sourceFileSize={mappingState.sourceFileSize}
        worksheetName={mappingState.worksheetName}
        onExportComplete={handleExportComplete}
      />

      <NewConfirmDialog
        open={showNewConfirmDialog}
        onOpenChange={setShowNewConfirmDialog}
        onConfirm={handleConfirmNew}
      />

      <UnsavedChangesDialog
        open={showUnsavedChangesDialog}
        onOpenChange={setShowUnsavedChangesDialog}
        onSave={handleUnsavedChangesSave}
        onDiscard={handleUnsavedChangesDiscard}
        onCancel={() => setShowUnsavedChangesDialog(false)}
      />

      <div className="container mx-auto px-4 py-8 flex-grow">
        <PageHeader
          onNew={handleNew}
          onSave={handleDirectSave}
          onLoad={handleLoad}
          onDelete={handleDelete}
          onInfo={() => setShowInfoDialog(true)}
          onShowLog={() => {
            if (latestReport) {
              setShowLogDialog(true);
            } else {
              showToast({
                title: "No Export Report",
                description: "Export a file first to generate a report.",
                variant: "default"
              });
            }
          }}
          isSaving={isConfigLoading}
          hasUnsavedChanges={hasUnsavedChanges}
          isLoadingConfig={isLoadingConfigFromUrl}
        />

        <ColumnMapper
          onMappingChange={handleMappingChange}
          onExport={(data) => handleExport(data, mappingState.sourceFilename || '')}
          onDataLoaded={(columns, data, filename, worksheetName, fileSize) => {
            setSourceData(columns, data, { filename, worksheetName });
            // Update source file info with file size
            if (fileSize) {
              setSourceFileInfo(prev => prev ? { ...prev, size: fileSize } : null);
            }
          }}
          targetColumns={activeColumnSet === 'artikelen' ? ARTIKEL_COLUMNS : KLANTEN_COLUMNS}
          activeColumnSet={activeColumnSet}
          onColumnSetChange={setActiveColumnSet}
          filename={sourceFileInfo?.filename || ''}
          rowCount={sourceFileInfo?.rowCount || 0}
          onSourceFileChange={setSourceFileInfo}
          shouldReset={shouldResetMapper}
          currentMapping={mappingState.mapping}
          sourceData={mappingState.sourceData}
          sourceColumns={mappingState.sourceColumns}
          sourceFilename={mappingState.sourceFilename}
          worksheetName={mappingState.worksheetName}
          columnTransforms={mappingState.columnTransforms}
          isLoading={mappingState.isLoading}
          activeFilter={mappingState.activeFilter}
          onTransformUpdate={handleUpdateTransform}
          onFilterUpdate={setFilter}
          onReorder={handleReorder}
          columnOrder={mappingState.columnOrder}
          connectionCounter={mappingState.connectionCounter}
          onConnectionCounterUpdate={incrementConnectionCounter}
        />
      </div>
    </div>
  );
};

const ARTIKEL_COLUMNS = [
  // Priority fields in specified order
  "Artikelnummer", "Omschrijving", "Catalogusprijs", "Netto aankoopprijs",
  "Netto verkoopprijs 1", "BTW-percentage",
  
  // Tax fields
  "Recupel", "Auvibel", "Bebat", "Reprobel", "Accijnzen", "Ecoboni",
  "Leeggoed",
  
  // Product details
  "Eenheid", "Barcode", "Leveranciersnummer", "Artikelnummer fabrikant", "Artikelnummer leverancier",
  "Hoofdgroep", "Subgroep",
  
  // Stock fields
  "Stock verwerken?", "Minimum voorraad (ja/nee)", "Minimum voorraad (aantal)", "Minimum bestelhoeveelheid",
  
  // Stock location fields
  ...Array.from({length: 9}, (_, i) => `Voorraad locatie ${i + 1}`),
  ...Array.from({length: 9}, (_, i) => `Voorraad locatie ${i + 1} toevoegen`),
  "Is beginstock",
  
  // Status fields
  "Actief?", "Korting uitgeschakeld",
  
  // Language descriptions
  "Omschrijving NL", "Omschrijving GB", "Omschrijving DE", "Omschrijving FR", "Omschrijving TR",
  
  // Additional price fields
  "Netto verkoopprijs 2", "Netto verkoopprijs 3", "Netto verkoopprijs 4", "Netto verkoopprijs 5",
  "Netto verkoopprijs 6", "Netto verkoopprijs 7", "Netto verkoopprijs 8", "Netto verkoopprijs 9", "Netto verkoopprijs 10",

  // Extra fields in specified order
  ...Array.from({length: 20}, (_, i) => `Alfanumeriek extra veld ${i + 1}`),
  ...Array.from({length: 20}, (_, i) => `Numeriek extra veld ${i + 1}`),
  ...Array.from({length: 20}, (_, i) => `Logisch extra veld ${i + 1}`),

  // Price date ranges
  ...Array.from({length: 10}, (_, i) => [
    `Prijs ${i + 1}, datum van`,
    `Prijs ${i + 1}, datum tot`
  ]).flat(),

  // Remaining fields in specified order
  "merk", "Rekeningnummer", "Gemarkeerd voor label printer", "Aantal 2",

  // Intrastat fields
  "Intrastat, lidstaat van herkomst", "Intrastat, standaard gewest",
  "Intrastat, goederencode", "Intrastat, gewicht per eenheid", "Intrastat, land van oorsprong",
];

const KLANTEN_COLUMNS = [
  "Actief?",
  "Contactnummer",
  "Info",
  "Btw-nummer",
  "Standaard betalingstermijn",
  "Ondernemingsnummer",
  "Maximum herinnering",
  "Bedrijfsnaam",
  "Achternaam",
  "Voornaam",
  "Adres",
  "Adreslijn 2",
  "Nummer",
  "Bus",
  "Postcode",
  "E-mail",
  "Telefoon",
  "gsm",
  "Fax",
  "Stad",
  "Taal",
  "Landcode",
  "Betaling einde maand?",
  "Numeriek extra veld 1",
  "Numeriek extra veld 2",
  "Numeriek extra veld 3",
  "Numeriek extra veld 4",
  "Numeriek extra veld 5",
  "Numeriek extra veld 6",
  "Numeriek extra veld 7",
  "Numeriek extra veld 8",
  "Numeriek extra veld 9",
  "Numeriek extra veld 10",
  "Numeriek extra veld 11",
  "Numeriek extra veld 12",
  "Numeriek extra veld 13",
  "Numeriek extra veld 14",
  "Numeriek extra veld 15",
  "Numeriek extra veld 16",
  "Numeriek extra veld 17",
  "Numeriek extra veld 18",
  "Numeriek extra veld 19",
  "Numeriek extra veld 20",
  "Alfanumeriek extra veld 1",
  "Alfanumeriek extra veld 2",
  "Alfanumeriek extra veld 3",
  "Alfanumeriek extra veld 4",
  "Alfanumeriek extra veld 5",
  "Alfanumeriek extra veld 6",
  "Alfanumeriek extra veld 7",
  "Alfanumeriek extra veld 8",
  "Alfanumeriek extra veld 9",
  "Alfanumeriek extra veld 10",
  "Alfanumeriek extra veld 11",
  "Alfanumeriek extra veld 12",
  "Alfanumeriek extra veld 13",
  "Alfanumeriek extra veld 14",
  "Alfanumeriek extra veld 15",
  "Alfanumeriek extra veld 16",
  "Alfanumeriek extra veld 17",
  "Alfanumeriek extra veld 18",
  "Alfanumeriek extra veld 19",
  "Alfanumeriek extra veld 20",
  "Logisch extra veld 1",
  "Logisch extra veld 2",
  "Logisch extra veld 3",
  "Logisch extra veld 4",
  "Logisch extra veld 5",
  "Logisch extra veld 6",
  "Logisch extra veld 7",
  "Logisch extra veld 8",
  "Logisch extra veld 9",
  "Logisch extra veld 10",
  "Logisch extra veld 11",
  "Logisch extra veld 12",
  "Logisch extra veld 13",
  "Logisch extra veld 14",
  "Logisch extra veld 15",
  "Logisch extra veld 16",
  "Logisch extra veld 17",
  "Logisch extra veld 18",
  "Logisch extra veld 19",
  "Logisch extra veld 20",
  "Tijd veld 1",
  "Tijd veld 2",
  "Tijd veld 3",
  "Tijd veld 4",
  "Tijd veld 5",
  "Tijd veld 6",
  "Tijd veld 7",
  "Tijd veld 8",
  "Tijd veld 9",
  "Tijd veld 10",
  "Tijd veld 11",
  "Tijd veld 12",
  "Tijd veld 13",
  "Tijd veld 14",
  "Tijd veld 15",
  "Tijd veld 16",
  "Tijd veld 17",
  "Tijd veld 18",
  "Tijd veld 19",
  "Tijd veld 20"
];

export default Index;