/**
 * RegistrationSuccess Component
 * 
 * Displays success screen after registration with action buttons
 */

import { Check, Home } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface RegistrationSuccessProps {
    onRegisterAnother: () => void;
    onGoHome: () => void;
}

export function RegistrationSuccess({
    onRegisterAnother,
    onGoHome,
}: RegistrationSuccessProps) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
                {/* Header */}
                <div className="bg-linear-to-br from-success to-success/90 px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-10 h-10 text-success" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Registration Successful!
                    </h1>
                    <p className="text-success/20">
                        Participant has been registered successfully.
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                        <p className="text-sm text-success font-medium">
                            <span className="font-semibold">✓ Registration Confirmed:</span>
                            <br />
                            Your registration is confirmed and saved.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={onRegisterAnother}
                            variant="default"
                            className="w-full"
                        >
                            Register Another Participant
                        </Button>

                        <Button
                            onClick={onGoHome}
                            variant="outline"
                            className="w-full"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Go to Home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
