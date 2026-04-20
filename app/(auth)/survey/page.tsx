import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";

export default function SurveyPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card>
        <CardHeader>
          <CardTitle>Survey</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Survey page coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
