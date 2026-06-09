import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getNeo4jDriver } from "@/lib/neo4j";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, BookOpen, CheckCircle } from "lucide-react";
import { redirect } from "next/navigation";

export default async function EmployeeDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "employee") {
    redirect("/employee/login");
  }

  const driver = getNeo4jDriver();
  const dbSession = driver.session();
  let hasSubmitted = false;

  try {
    const username = session.user.id || session.user.name;
    const result = await dbSession.run(
      `
      MATCH (u:User {username: $username})-[:SUBMITTED]->(s:Submission)
      RETURN s
      `,
      { username }
    );
    if (result.records.length > 0) {
      hasSubmitted = true;
    }
  } finally {
    await dbSession.close();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {session.user.name}</h1>
        <p className="text-muted-foreground">
          {session.user.companyName}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className={`border ${hasSubmitted ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900" : "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900"}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className={`h-5 w-5 ${hasSubmitted ? "text-green-600" : "text-primary"}`} />
              Your Assessment Status
            </CardTitle>
            <CardDescription>Current progress on your Agile & AI readiness assessment.</CardDescription>
          </CardHeader>
          <CardContent>
            {hasSubmitted ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-2xl font-bold text-green-600 mb-2">
                  <CheckCircle className="h-6 w-6" /> Completed
                </div>
                <p className="text-sm text-muted-foreground">
                  You have successfully submitted your assessment. Thank you for your participation!
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Assessment Submitted
                </Button>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-primary mb-4">Pending</div>
                <Link href="/employee/assessment">
                  <Button className="w-full">Start Assessment</Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              Learn the Framework
            </CardTitle>
            <CardDescription>Understand the metrics before you start.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Read about the Sidky Agile Adoption Framework and our AI Readiness dimensions to ensure you answer accurately.
            </p>
            <Link href="/employee/mapping">
              <Button variant="outline" className="w-full">View Mapping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
