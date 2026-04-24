import { RecentEnrollment } from '../types';
import { User, Calendar } from 'lucide-react';
import { DataTable, SectionHeader } from '@/shared';

interface RecentEnrollmentsProps {
    data: RecentEnrollment[];
}

export function RecentEnrollments({ data }: RecentEnrollmentsProps) {
    return (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
            <SectionHeader
                title="Recent Enrollments"
                icon={Calendar}
            />
            <div className="flex-1 overflow-y-auto">
                <DataTable
                    data={data}
                    emptyMessage="No recent enrollments"
                    columns={[
                        {
                            header: 'Participant',
                            accessor: (enroll) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-foreground">{enroll.kh_name}</p>
                                        <p className="text-[9px] text-muted-foreground uppercase font-bold">{enroll.en_name}</p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            header: 'Sport',
                            accessor: (enroll) => (
                                <div className="flex flex-col">
                                    <p className="text-[10px] font-black text-foreground uppercase tracking-tight">{enroll.sport_name}</p>
                                    <p className="text-[9px] text-muted-foreground uppercase font-medium">{enroll.gender}</p>
                                </div>
                            ),
                        },
                        {
                            header: 'Date',
                            align: 'right',
                            accessor: (enroll) => (
                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                                    {new Date(enroll.createdAt).toLocaleDateString()}
                                </p>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
}
