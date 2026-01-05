import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiService } from "@/services/api";
import type { StudyPlan, StudyPlanSession } from "@/types/task";
import { useToast } from "@/components/ui/use-toast";
import { addDays, format, startOfToday } from "date-fns";
import { Calendar, CalendarDays, Clock } from "lucide-react";

export function StudyPlanGenerator() {
  const [availableHours, setAvailableHours] = useState("4");
  const [sessionDuration, setSessionDuration] = useState("1");
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const parseDate = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatRange = (session: StudyPlanSession) => {
    const start = parseDate(session.start_time);
    const end = parseDate(session.end_time);
    if (start && end) {
      return `${format(start, "p")} - ${format(end, "p")}`;
    }
    if (start) {
      return `${format(start, "p")} • ${session.duration.toFixed(1)}h`;
    }
    return `${session.duration.toFixed(1)}h block`;
  };

  const { calendarDays, scheduleByDay, unscheduled } = (() => {
    if (!plan) return { calendarDays: [], scheduleByDay: {}, unscheduled: [] as StudyPlanSession[] };

    const buckets = plan.schedule.reduce<Record<string, StudyPlanSession[]>>((acc, session) => {
      const sessionDate = parseDate(session.start_time) ?? parseDate(session.timedue);
      const key = sessionDate ? format(sessionDate, "yyyy-MM-dd") : "unscheduled";
      acc[key] = [...(acc[key] ?? []), session];
      return acc;
    }, {});

    const dayKeys = Object.keys(buckets)
      .filter((key) => key !== "unscheduled")
      .sort();

    const fallbackDays = Array.from({ length: 5 }, (_, idx) =>
      format(addDays(startOfToday(), idx), "yyyy-MM-dd")
    );

    return {
      calendarDays: dayKeys.length ? dayKeys : fallbackDays,
      scheduleByDay: buckets,
      unscheduled: buckets["unscheduled"] ?? [],
    };
  })();

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
      <Card className="border-slate-200/80 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>Generate Study Plan</CardTitle>
          <CardDescription>
            Create a personalized study schedule based on your available time and task priorities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Card className="border-slate-200/80 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle>Your Study Schedule</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-2">
                <span>{plan.total_tasks} tasks</span>
                <span className="text-slate-400">•</span>
                <span>{plan.total_study_hours.toFixed(1)} total hours</span>
                {plan.adjustment_reason && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span>{plan.adjustment_reason}</span>
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plan.schedule.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No tasks to schedule. Create some tasks first!
                </p>
              ) : (
                <div className="space-y-4">
                  {plan.schedule.map((session, index) => (
                    <div
                      key={`${session.task_name}-${index}`}
                      className="rounded-xl border border-slate-200 bg-white/70 p-4 transition-colors hover:bg-slate-50"
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-lg font-semibold">{session.task_name}</h4>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            {session.priority}
                          </p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          Priority score {session.priority_score.toFixed(2)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground md:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {session.start_time
                              ? format(new Date(session.start_time), "PPp")
                              : "Not scheduled"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatRange(session)}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          Difficulty: {session.difficulty}/5
                        </span>
                        <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          {session.priority}
                        </span>
                        {session.note && (
                          <span className="rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
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

          <Card className="border-slate-200/80 bg-white/90 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Calendar View</CardTitle>
                  <CardDescription>See your week laid out like a Notion board</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {calendarDays.map((dayKey) => {
                  const dayDate = new Date(dayKey);
                  const sessions = scheduleByDay[dayKey] ?? [];

                  return (
                    <div
                      key={dayKey}
                      className="flex flex-col rounded-xl border border-slate-200 bg-white/80 p-3 shadow-[inset_0_1px_0_rgba(0,0,0,0.02)]"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            {format(dayDate, "EEE")}
                          </p>
                          <p className="text-lg font-semibold">{format(dayDate, "MMM d")}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                          {sessions.length ? `${sessions.length} session${sessions.length > 1 ? "s" : ""}` : "Open day"}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {sessions.length ? (
                          sessions.map((session, index) => (
                            <div
                              key={`${session.task_name}-${index}-calendar`}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold">{session.task_name}</p>
                                <span className="text-xs text-slate-500">
                                  {session.duration.toFixed(1)}h
                                </span>
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatRange(session)}
                                </span>
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                                  {session.priority}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No sessions planned.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {unscheduled.length > 0 && (
                <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4">
                  <p className="mb-2 text-sm font-semibold text-slate-700">Not scheduled yet</p>
                  <div className="space-y-2">
                    {unscheduled.map((session, index) => (
                      <div
                        key={`${session.task_name}-unscheduled-${index}`}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{session.task_name}</span>
                        <span className="text-xs text-slate-500">{session.duration.toFixed(1)}h block</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
