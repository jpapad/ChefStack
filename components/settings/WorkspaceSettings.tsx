import React from 'react';
import { InventoryLocation, HaccpItem } from '../../types';
import InventoryLocationsManager from './InventoryLocationsManager';
import HaccpItemsManager from './HaccpItemsManager';

interface WorkspaceSettingsProps {
    inventoryLocations: InventoryLocation[];
    setInventoryLocations: React.Dispatch<React.SetStateAction<InventoryLocation[]>>;
    haccpItems: HaccpItem[];
    setHaccpItems: React.Dispatch<React.SetStateAction<HaccpItem[]>>;
    currentTeamId: string;
}

const WorkspaceSettings: React.FC<WorkspaceSettingsProps> = ({ inventoryLocations, setInventoryLocations, haccpItems, setHaccpItems, currentTeamId }) => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <InventoryLocationsManager 
                inventoryLocations={inventoryLocations}
                setInventoryLocations={setInventoryLocations}
            />
            <HaccpItemsManager
                haccpItems={haccpItems}
                setHaccpItems={setHaccpItems}
                currentTeamId={currentTeamId}
            />
        </div>
    );
};

export default WorkspaceSettings;
