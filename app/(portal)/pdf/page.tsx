import { PdfFilterForm } from '@/features/pdf/components/PdfFilterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'PDF Reports',
    description: 'Generate PDF registration reports',
};

export default function PdfPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
            <div className="max-w-2xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    PDF Registration Reporting
                </h1>
                <p className="text-slate-600">Generate structured participant lists by sport and organization</p>
            </div>
            
            <PdfFilterForm />
        </main>
    );
}
