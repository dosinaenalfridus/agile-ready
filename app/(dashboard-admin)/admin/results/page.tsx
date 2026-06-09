import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getNeo4jDriver } from "@/lib/neo4j";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

export default async function AdminResultsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const driver = getNeo4jDriver();
  const dbSession = driver.session();
  let results: any[] = [];

  try {
    const companyCode = session.user.companyCode;

    // Fetch employees and their submission status
    const dbResult = await dbSession.run(
      `
      MATCH (emp:User {role: 'employee'})-[:BELONGS_TO]->(c:Company {companyCode: $companyCode})
      OPTIONAL MATCH (emp)-[:SUBMITTED]->(s:Submission)
      RETURN emp.username AS username, emp.name AS name, emp.nip AS nip, s IS NOT NULL AS hasSubmitted
      ORDER BY emp.name ASC
      `,
      { companyCode }
    );

    results = dbResult.records.map(record => ({
      username: record.get("username"),
      name: record.get("name") || record.get("username"),
      nip: record.get("nip") || "-",
      hasSubmitted: record.get("hasSubmitted"),
    }));
  } finally {
    await dbSession.close();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assessment Results</h1>
        <p className="text-muted-foreground">
          View aggregated Agile and AI readiness scores for your organization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Scores</CardTitle>
          <CardDescription>Status of employee assessment submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No employees found. Create employees first.
            </div>
          ) : (
            <div className="max-h-[500px] overflow-auto border rounded-md relative">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>NIP</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.username}>
                      <TableCell className="font-medium">{result.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{result.nip}</TableCell>
                      <TableCell>{result.username}</TableCell>
                      <TableCell>
                        <Badge className={result.hasSubmitted ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"}>
                          {result.hasSubmitted ? "Completed" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {result.hasSubmitted ? (
                          <Link href={`/admin/results/${result.username}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Breakdown
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            <Eye className="w-4 h-4 mr-2" />
                            View Breakdown
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
