import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getNeo4jDriver } from "@/lib/neo4j";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function EmployeeResultBreakdownPage(props: { params: Promise<{ employeeId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const employeeId = params.employeeId;
  const driver = getNeo4jDriver();
  const dbSession = driver.session();

  let saafTotal = 0;
  let aiTotal = 0;
  let responseCount = 0;

  try {
    const result = await dbSession.run(
      `
      MATCH (u:User {username: $username})-[:SUBMITTED]->(s:Submission)-[:HAS_RESPONSE]->(r:Response)-[:ANSWERS]->(q:Question)
      RETURN q.type AS type, sum(r.score) AS totalScore, count(r) AS count
      `,
      { username: employeeId }
    );

    result.records.forEach(record => {
      const type = record.get("type");
      const score = record.get("totalScore").toNumber();
      responseCount += record.get("count").toNumber();
      
      if (type === "SAAF") {
        saafTotal = score;
      } else if (type === "AI") {
        aiTotal = score;
      }
    });
  } finally {
    await dbSession.close();
  }

  if (responseCount === 0) {
    return (
      <div className="space-y-6">
        <Link href="/admin/results" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Results
        </Link>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No assessment results found for this employee.
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate Scores
  const MAX_SAAF_POINTS = 45 * 5; // 225
  const MAX_AI_POINTS = 10 * 5; // 50

  const saafPercentage = (saafTotal / MAX_SAAF_POINTS) * 100;
  const aiPercentage = (aiTotal / MAX_AI_POINTS) * 100;

  const getReadinessLevel = (percentage: number) => {
    if (percentage >= 80) return { label: "Ready", color: "bg-green-500" };
    if (percentage >= 60) return { label: "Transitioning", color: "bg-yellow-500" };
    return { label: "Ad-Hoc", color: "bg-red-500" };
  };

  const saafLevel = getReadinessLevel(saafPercentage);
  const aiLevel = getReadinessLevel(aiPercentage);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/results" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Results
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Score Breakdown: {employeeId}</h1>
        <p className="text-muted-foreground mt-1">
          Detailed mathematical breakdown of the assessment responses.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* SAAF Result Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>SAAF Metrics</CardTitle>
              <Badge className={saafLevel.color}>{saafLevel.label}</Badge>
            </div>
            <CardDescription>Sidky Agile Adoption Framework</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-5xl font-bold text-primary">
              {saafPercentage.toFixed(1)}%
            </div>
            
            <div className="bg-muted p-4 rounded-md font-mono text-sm space-y-2">
              <p className="text-muted-foreground">Mathematical Breakdown:</p>
              <p>Total SAAF Points: {saafTotal} out of {MAX_SAAF_POINTS}</p>
              <p className="text-primary font-medium">Formula: ({saafTotal}/{MAX_SAAF_POINTS}) * 100 = {saafPercentage.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Result Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI Readiness</CardTitle>
              <Badge className={aiLevel.color}>{aiLevel.label}</Badge>
            </div>
            <CardDescription>Infrastructure, Skills, and Policy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-5xl font-bold text-primary">
              {aiPercentage.toFixed(1)}%
            </div>
            
            <div className="bg-muted p-4 rounded-md font-mono text-sm space-y-2">
              <p className="text-muted-foreground">Mathematical Breakdown:</p>
              <p>Total AI Points: {aiTotal} out of {MAX_AI_POINTS}</p>
              <p className="text-primary font-medium">Formula: ({aiTotal}/{MAX_AI_POINTS}) * 100 = {aiPercentage.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
