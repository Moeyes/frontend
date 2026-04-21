"use client";

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { FormSection } from "@/components/FormSection";
import { StepIndicator } from "@/components/StepIndicator";
import { Trophy, Users, FileCheck, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [demoStep, setDemoStep] = useState(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                C
              </div>
              <h1 className="text-xl font-bold text-primary">Choschmous</h1>
            </div>
            <nav className="flex items-center gap-6">
              <button className="text-foreground hover:text-primary transition-colors font-medium">
                Platform
              </button>
              <button className="text-foreground hover:text-primary transition-colors font-medium">
                About
              </button>
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Professional Sports Event Registration
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A modern, enterprise-grade platform for managing sports events,
              athlete registration, and competition organization with an elegant
              admin dashboard design.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <Trophy className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  Event Management
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create, manage, and organize sports events with comprehensive
                  details and registration options.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Users className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  Athlete Registration
                </h3>
                <p className="text-sm text-muted-foreground">
                  Streamlined registration process for athletes with document
                  verification and approval workflow.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <FileCheck className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  Document Handling
                </h3>
                <p className="text-sm text-muted-foreground">
                  Secure document upload and verification with automated
                  confirmation notifications.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Design System Showcase */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold text-primary mb-8">Design System Showcase</h3>

          {/* Color System */}
          <div className="mb-12">
            <h4 className="text-lg font-semibold text-foreground mb-4">
              Professional Color Palette
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="rounded-lg overflow-hidden border border-border">
                <div className="h-20 bg-primary" />
                <div className="p-3">
                  <p className="text-xs font-semibold text-foreground">Primary Navy</p>
                  <p className="text-xs text-muted-foreground">#1F3A5C</p>
                </div>
              </div>

              <div className="rounded-lg overflow-hidden border border-border">
                <div className="h-20 bg-accent" />
                <div className="p-3">
                  <p className="text-xs font-semibold text-foreground">Accent Blue</p>
                  <p className="text-xs text-muted-foreground">#3B82F6</p>
                </div>
              </div>

              <div className="rounded-lg overflow-hidden border border-border">
                <div className="h-20 bg-muted" />
                <div className="p-3">
                  <p className="text-xs font-semibold text-foreground">Muted</p>
                  <p className="text-xs text-muted-foreground">#F0F3F7</p>
                </div>
              </div>

              <div className="rounded-lg overflow-hidden border border-border">
                <div className="h-20 bg-card" />
                <div className="p-3">
                  <p className="text-xs font-semibold text-foreground">Card</p>
                  <p className="text-xs text-muted-foreground">#FFFFFF</p>
                </div>
              </div>

              <div className="rounded-lg overflow-hidden border border-border">
                <div className="h-20 bg-background" />
                <div className="p-3">
                  <p className="text-xs font-semibold text-foreground">Background</p>
                  <p className="text-xs text-muted-foreground">#F7F9FC</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step Indicator Demo */}
          <div className="mb-12">
            <h4 className="text-lg font-semibold text-foreground mb-4">
              Step Indicator Component
            </h4>
            <Card>
              <CardContent className="pt-6">
                <StepIndicator
                  steps={["Event", "Personal", "Documents", "Review"]}
                  currentStep={demoStep}
                  totalSteps={4}
                />
                <div className="flex gap-3 mt-8">
                  <Button
                    variant="secondary"
                    onClick={() => setDemoStep(Math.max(1, demoStep - 1))}
                    disabled={demoStep === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setDemoStep(Math.min(4, demoStep + 1))}
                    disabled={demoStep === 4}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Section Demo */}
          <div className="mb-12">
            <h4 className="text-lg font-semibold text-foreground mb-4">
              Form Section Component
            </h4>
            <FormSection
              title="Event Details"
              description="Select your event, organization, sport, and category"
              icon={Trophy}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Event Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    placeholder="Enter event name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    placeholder="Select category"
                  />
                </div>
              </div>
            </FormSection>
          </div>

          {/* Button Variants */}
          <div className="mb-12">
            <h4 className="text-lg font-semibold text-foreground mb-4">
              Button Variants
            </h4>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary">Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button variant="primary" isLoading>
                    Loading State
                  </Button>
                  <Button variant="primary" disabled>
                    Disabled Button
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert Components */}
          <div className="mb-12">
            <h4 className="text-lg font-semibold text-foreground mb-4">
              Alert Components
            </h4>
            <div className="space-y-4">
              <div className="bg-accent/10 border border-accent/30 text-accent rounded-lg p-4 text-sm mb-6">
                <p className="font-medium">
                  ℹ️ This is an info alert with helpful information for users.
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-4 text-sm mb-6">
                <p className="font-medium">
                  ✓ This is a success alert confirming a completed action.
                </p>
              </div>
              <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 text-sm mb-6">
                <p className="font-medium">
                  ✕ This is an error alert showing validation or system errors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-primary-foreground/90 mb-6 max-w-md mx-auto">
            Join the platform and begin managing your sports events with our
            professional admin dashboard.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" className="!text-primary-foreground !border-primary-foreground">
              Learn More
            </Button>
            <Button variant="outline" className="!bg-white !text-primary !border-white">
              Start Registration
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground text-sm">
            <p>© 2026 Choschmous. All rights reserved.</p>
            <p className="mt-2">Professional Sports Event Registration Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
