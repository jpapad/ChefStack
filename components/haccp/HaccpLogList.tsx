// Fix: Created the component to display a list of HACCP logs.
import React from 'react';
import { HaccpLog, HaccpItem } from '../../types';
import { Icon } from '../common/Icon';
import { HaccpLogListSkeleton } from './HaccpLogListSkeleton';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface HaccpLogListProps {
  logs: HaccpLog[];
  haccpItems: HaccpItem[];
  onDelete: (log: HaccpLog) => void;
  canManage: boolean;
  isLoading?: boolean;
}

const HaccpLogList: React.FC<HaccpLogListProps> = ({ logs, haccpItems, onDelete, canManage, isLoading = false }) => {
    const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('el-GR', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(date);
    }
    
    if (isLoading) {
        return <HaccpLogListSkeleton count={10} />;
    }
    
    return (
        <div className="space-y-3">
        {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Δεν υπάρχουν καταχωρήσεις.</p>
        ) : (
            logs.map(log => {
                const item = haccpItems.find(i => i.id === log.haccpItemId);
                return (
                    <Card key={log.id} className="group hover:shadow-lg transition-all duration-200">
                        <div className="p-4 flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h3 className="font-semibold text-lg">{item?.name || 'Άγνωστο Σημείο'}</h3>
                                    {item && (
                                        <Badge variant="secondary">
                                            {item.category}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="font-medium">
                                        {log.type}
                                    </Badge>
                                    {log.value && (
                                        <Badge className="font-mono bg-brand-yellow/20 text-brand-dark dark:bg-brand-yellow/30 border-brand-yellow/50">
                                            {log.value}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Icon name="clock" className="w-3 h-3" />
                                    {formatDateTime(new Date(log.timestamp))}
                                    <span className="text-muted-foreground">•</span>
                                    <Icon name="user" className="w-3 h-3" />
                                    <span className="font-medium">{log.user}</span>
                                </p>
                            </div>
                            {canManage && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => onDelete(log)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                    title="Delete"
                                >
                                    <Icon name="trash-2" className="w-4 h-4"/>
                                </Button>
                            )}
                        </div>
                    </Card>
                )
            })
        )}
        </div>
    );
};

export default HaccpLogList;
