/**
 * RecentEnrollments Component
 */

'use client';

import { RecentEnrollment } from '../types';
import { User, Calendar } from 'lucide-react';

interface RecentEnrollmentsProps {
    data: RecentEnrollment[];
}

export function RecentEnrollments({ data }: RecentEnrollmentsProps) {
    return (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 pb-4 border-b border-border flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Enrollments</h3>
                <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-border">
                        {data.length === 0 ? (
                            <tr><td className="p-8 text-center text-xs text-muted-foreground italic">No recent enrollments</td></tr>
                        ) : (
                            data.map((enroll) => (
                                <tr key={enroll.id} className="hover:bg-secondary/10 transition-colors">
                                    <td className="p-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{enroll.kh_name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">{enroll.en_name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 py-3">
                                        <p className="text-xs font-semibold text-foreground">{enroll.sport_name}</p>
                                        <p className="text-[10px] text-muted-foreground">{enroll.gender}</p>
                                    </td>
                                    <td className="p-4 py-3 text-right">
                                        <p className="text-[10px] text-muted-foreground font-bold">
                                            {new Date(enroll.createdAt).toLocaleDateString()}
                                        </p>
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
