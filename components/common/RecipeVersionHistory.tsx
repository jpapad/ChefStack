import React, { useState } from 'react';
import { Recipe, RecipeVersion, User } from '../../types';
import { Icon } from './Icon';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useTranslation } from '../../i18n';

interface RecipeVersionHistoryProps {
  recipe: Recipe;
  users: User[];
  onClose: () => void;
  onRestore: (version: RecipeVersion) => void;
  onCompare?: (versionA: RecipeVersion, versionB: RecipeVersion) => void;
}

export const RecipeVersionHistory: React.FC<RecipeVersionHistoryProps> = ({
  recipe,
  users,
  onClose,
  onRestore,
  onCompare
}) => {
  const { t } = useTranslation();
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);

  const versions = recipe.versions || [];
  const sortedVersions = [...versions].sort((a, b) => 
    new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  const getUserName = (userId: string) => {
    return (users || []).find(u => u.id === userId)?.name || 'Unknown User';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `πριν ${diffMins} λεπτά`;
    if (diffHours < 24) return `πριν ${diffHours} ώρες`;
    if (diffDays < 7) return `πριν ${diffDays} μέρες`;
    
    return date.toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId]);
    }
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2 && onCompare) {
      const versionA = versions.find(v => v.id === selectedVersions[0])!;
      const versionB = versions.find(v => v.id === selectedVersions[1])!;
      onCompare(versionA, versionB);
    }
  };

  const getChangeIcon = (change: string) => {
    if (change.includes('ingredient') || change.includes('υλικ')) return 'package';
    if (change.includes('step') || change.includes('βήμ')) return 'list';
    if (change.includes('description') || change.includes('περιγραφ')) return 'edit';
    if (change.includes('time') || change.includes('χρόν')) return 'clock';
    if (change.includes('servings') || change.includes('μερίδ')) return 'users';
    return 'edit';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="history" className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Ιστορικό Εκδόσεων</h2>
              <p className="text-sm text-muted-foreground">
                {recipe.name} • {versions.length} εκδόσεις
              </p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={onClose}>
            <Icon name="x" className="w-5 h-5" />
          </Button>
        </div>

        {/* Compare Bar */}
        {selectedVersions.length > 0 && (
          <div className="p-4 bg-primary/10 border-b border-border flex items-center justify-between">
            <p className="text-sm font-medium">
              {selectedVersions.length === 1 
                ? '1 έκδοση επιλεγμένη' 
                : `${selectedVersions.length} εκδόσεις επιλεγμένες`}
            </p>
            <div className="flex gap-2">
              {selectedVersions.length === 2 && onCompare && (
                <Button size="sm" onClick={handleCompare}>
                  <Icon name="arrow-right-left" className="w-4 h-4 mr-2" />
                  Σύγκριση
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedVersions([])}
              >
                Καθαρισμός
              </Button>
            </div>
          </div>
        )}

        {/* Version List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Current Version */}
          <div className="relative pl-8 pb-4">
            <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-green-500 border-4 border-white dark:border-slate-900" />
            <div className="absolute left-[7px] top-6 bottom-0 w-0.5 bg-border" />
            
            <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                    ΤΡΕΧΟΥΣΑ
                  </span>
                  <span className="font-semibold">
                    v{recipe.currentVersion || versions.length + 1}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(recipe.updatedAt || new Date().toISOString())}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {recipe.description.substring(0, 100)}...
              </p>
            </Card>
          </div>

          {/* Previous Versions */}
          {sortedVersions.map((version, index) => {
            const isExpanded = expandedVersionId === version.id;
            const isSelected = selectedVersions.includes(version.id);
            const isLastVersion = index === sortedVersions.length - 1;

            return (
              <div key={version.id} className="relative pl-8">
                <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-primary border-4 border-white dark:border-slate-900" />
                {!isLastVersion && (
                  <div className="absolute left-[7px] top-6 bottom-0 w-0.5 bg-border" />
                )}
                
                <Card 
                  className={`p-4 transition-colors ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      {onCompare && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleVersionSelect(version.id)}
                          disabled={selectedVersions.length >= 2 && !isSelected}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">v{version.version}</span>
                          <span className="text-sm text-muted-foreground">
                            από {getUserName(version.changedBy)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(version.changedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedVersionId(isExpanded ? null : version.id)}
                      >
                        <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRestore(version)}
                      >
                        <Icon name="history" className="w-4 h-4 mr-1" />
                        Επαναφορά
                      </Button>
                    </div>
                  </div>

                  {/* Comment */}
                  {version.comment && (
                    <p className="text-sm mb-3 p-2 bg-accent/50 rounded italic">
                      "{version.comment}"
                    </p>
                  )}

                  {/* Changes Preview */}
                  <div className="space-y-1">
                    {(version.changes || []).slice(0, isExpanded ? undefined : 3).map((change, i) => (
                      <div 
                        key={i}
                        className="flex items-start gap-2 text-sm p-2 rounded hover:bg-accent/30"
                      >
                        <Icon 
                          name={getChangeIcon(change)} 
                          className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" 
                        />
                        <span className="flex-1">{change}</span>
                      </div>
                    ))}
                    {!isExpanded && (version.changes || []).length > 3 && (
                      <button
                        onClick={() => setExpandedVersionId(version.id)}
                        className="text-xs text-primary hover:underline ml-6"
                      >
                        +{(version.changes || []).length - 3} ακόμα αλλαγές
                      </button>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}

          {versions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="history" className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Δεν υπάρχουν προηγούμενες εκδόσεις</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default RecipeVersionHistory;
