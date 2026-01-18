import React from 'react';
import { RecipeVersion } from '../../types';
import { Icon } from './Icon';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useTranslation } from '../../i18n';

interface VersionCompareProps {
  versionA: RecipeVersion;
  versionB: RecipeVersion;
  onClose: () => void;
}

export const VersionCompare: React.FC<VersionCompareProps> = ({
  versionA,
  versionB,
  onClose
}) => {
  const { t } = useTranslation();

  // Determine which is older/newer
  const [olderVersion, newerVersion] = 
    new Date(versionA.changedAt) < new Date(versionB.changedAt)
      ? [versionA, versionB]
      : [versionB, versionA];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifferences = () => {
    const changesA = new Set(olderVersion.changes || []);
    const changesB = new Set(newerVersion.changes || []);
    
    const added = (newerVersion.changes || []).filter(change => !changesA.has(change));
    const removed = (olderVersion.changes || []).filter(change => !changesB.has(change));
    const common = (olderVersion.changes || []).filter(change => changesB.has(change));

    return { added, removed, common };
  };

  const differences = getDifferences();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-6xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="arrow-right-left" className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Σύγκριση Εκδόσεων</h2>
              <p className="text-sm text-muted-foreground">
                v{olderVersion.version} vs v{newerVersion.version}
              </p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={onClose}>
            <Icon name="x" className="w-5 h-5" />
          </Button>
        </div>

        {/* Compare Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 divide-x divide-border">
            {/* Older Version */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-full">
                    ΠΑΛΑΙΟΤΕΡΗ
                  </span>
                  <span className="font-semibold text-lg">v{olderVersion.version}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(olderVersion.changedAt)}
                </p>
                {olderVersion.comment && (
                  <p className="text-sm mt-2 p-2 bg-accent/50 rounded italic">
                    "{olderVersion.comment}"
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Αλλαγές
                </h3>
                {olderVersion.changes.map((change, i) => {
                  const isRemoved = differences.removed.includes(change);
                  const isCommon = differences.common.includes(change);
                  
                  return (
                    <div
                      key={i}
                      className={`p-2 rounded text-sm ${
                        isRemoved
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 line-through'
                          : isCommon
                          ? 'bg-gray-50 dark:bg-gray-800/50'
                          : 'bg-gray-50 dark:bg-gray-800/50'
                      }`}
                    >
                      {change}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Newer Version */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded-full">
                    ΝΕΟΤΕΡΗ
                  </span>
                  <span className="font-semibold text-lg">v{newerVersion.version}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(newerVersion.changedAt)}
                </p>
                {newerVersion.comment && (
                  <p className="text-sm mt-2 p-2 bg-accent/50 rounded italic">
                    "{newerVersion.comment}"
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Αλλαγές
                </h3>
                {newerVersion.changes.map((change, i) => {
                  const isAdded = differences.added.includes(change);
                  const isCommon = differences.common.includes(change);
                  
                  return (
                    <div
                      key={i}
                      className={`p-2 rounded text-sm ${
                        isAdded
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium'
                          : isCommon
                          ? 'bg-gray-50 dark:bg-gray-800/50'
                          : 'bg-gray-50 dark:bg-gray-800/50'
                      }`}
                    >
                      {change}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-6 border-t border-border bg-accent/30">
            <h3 className="text-sm font-semibold mb-3">Περίληψη Διαφορών</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {differences.added.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Νέες αλλαγές
                </div>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {differences.removed.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Αφαιρέθηκαν
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {differences.common.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Κοινές αλλαγές
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VersionCompare;
