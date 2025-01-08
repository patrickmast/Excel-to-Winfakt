import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useConfiguration } from "@/hooks/use-configuration";
import SavedConfigDialog from "./SavedConfigDialog";
import InfoDialog from "./InfoDialog";

interface SaveConfigurationProps {
  currentConfigId: string | null;
  showInfoDialog: boolean;
  onInfoDialogChange: (open: boolean) => void;
}

const SaveConfiguration = ({ 
  currentConfigId, 
  showInfoDialog, 
  onInfoDialogChange 
}: SaveConfigurationProps) => {
  const [showSavedDialog, setShowSavedDialog] = useState(false);
  const [savedConfigUrl, setSavedConfigUrl] = useState('');

  return (
    <>
      <SavedConfigDialog
        open={showSavedDialog}
        onOpenChange={setShowSavedDialog}
        configUrl={savedConfigUrl}
      />
      
      <InfoDialog 
        open={showInfoDialog}
        onOpenChange={onInfoDialogChange}
        configId={currentConfigId}
      />
    </>
  );
};

export default SaveConfiguration;