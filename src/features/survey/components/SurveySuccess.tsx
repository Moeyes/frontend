'use client';

import { Button } from '@/components/Button';
import { CheckCircle2 } from 'lucide-react';

interface SurveySuccessProps {
    onRegisterAnother?: () => void;
}

export function SurveySuccess({ onRegisterAnother }: SurveySuccessProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4 flex items-center justify-center">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-3">Registration Successful!</h1>
                    <p className="text-slate-600 mb-8">
                        Your organization has been successfully registered for the event. Thank you for participating!
                    </p>

                    {onRegisterAnother && (
                        <Button onClick={onRegisterAnother} className="w-full">
                            Register Another Organization
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
