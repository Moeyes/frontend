/**
 * TopOrgsTable Component
 */

'use client';

import { TopOrganization } from '../types';
import { Building2 } from 'lucide-react';

interface TopOrgsTableProps {
    data: TopOrganization[];
}

export function TopOrgsTable({ data }: TopOrgsTableProps) {
    return (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 pb-4 border-b border-border flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top Organizations</h3>
                <Building2 className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-border">
                        {data.length === 0 ? (
                            <tr><td className="p-8 text-center text-xs text-muted-foreground italic">No organization data</td></tr>
                        ) : (
                            data.map((org, i) => (
                                <tr key={org.id || i} className="hover:bg-secondary/10 transition-colors">
                                    <td className="p-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}.</span>
                                            <span className="text-sm font-bold text-foreground truncate max-w-[150px]">{org.name_kh}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 py-3 text-right">
                                        <span className="text-sm font-black text-primary">{org.participant_count}</span>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground ml-2">Members</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
