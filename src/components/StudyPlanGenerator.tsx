import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiService } from "@/services/api";
import type { StudyPlan } from "@/types/task";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";

export function StudyPlanGenerator() {
  const [availableHours, setAvailableHours] = useState("4");
  const [sessionDuration, setSessionDuration] = useState("1");
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const generatedPlan = await apiService.generateStudyPlan(
        parseFloat(availableHours),
        parseFloat(sessionDuration)
      );
      setPlan(generatedPlan);
      toast({
        title: "Study plan generated",
        description: `Created a plan with ${generatedPlan.schedule.length} study sessions`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Study Plan</CardTitle>
          <CardDescription>
            Create a personalized study schedule based on your available time and task priorities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availableHours">Available Hours per Day</Label>
                <Input
                  id="availableHours"
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionDuration">Session Duration (hours)</Label>
                <Input
                  id="sessionDuration"
                  type="number"
                  min="0.25"
                  max="8"
                  step="0.25"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Generating..." : "Generate Study Plan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {plan && (
        <Card>
          <CardHeader>
            <CardTitle>Your Study Schedule</CardTitle>
            <CardDescription>
              {plan.total_tasks} tasks • {plan.total_study_hours.toFixed(1)} total hours
              {plan.adjustment_reason && ` • ${plan.adjustment_reason}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {plan.schedule.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No tasks to schedule. Create some tasks first!
              </p>
            ) : (
              <div className="space-y-4">
                {plan.schedule.map((session, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-lg">{session.task_name}</h4>
                      <span className="text-sm font-medium text-primary">
                        Priority: {session.priority_score.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {session.start_time ? format(new Date(session.start_time), "PPp") : "Not scheduled"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{session.duration.toFixed(1)} hours</span>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                        Difficulty: {session.difficulty}/5
                      </span>
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        {session.priority}
                      </span>
                      {session.note && (
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                          {session.note}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
