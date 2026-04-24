import { TopOrganization } from '../types';
import { Building2 } from 'lucide-react';
import { DataTable, SectionHeader } from '@/shared';

interface TopOrgsTableProps {
    data: TopOrganization[];
}

export function TopOrgsTable({ data }: TopOrgsTableProps) {
    return (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
            <SectionHeader
                title="Top Organizations"
                icon={Building2}
            />
            <div className="flex-1 overflow-y-auto">
                <DataTable
                    data={data}
                    emptyMessage="No organization data"
                    columns={[
                        {
                            header: '#',
                            className: 'w-10',
                            accessor: (_, index) => (
                                <span className="text-[10px] font-black text-muted-foreground opacity-50">
                                    {(index || 0) + 1}
                                </span>
                            ),
                        },
                        {
                            header: 'Organization',
                            accessor: (org) => (
                                <span className="text-xs font-black text-foreground truncate block max-w-[150px]">
                                    {org.name_kh}
                                </span>
                            ),
                        },
                        {
                            header: 'Members',
                            align: 'right',
                            accessor: (org) => (
                                <div className="flex items-baseline justify-end gap-1.5">
                                    <span className="text-sm font-black text-primary">{org.participant_count}</span>
                                    <span className="text-[8px] uppercase font-black text-muted-foreground opacity-60 tracking-tighter">Members</span>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
}
