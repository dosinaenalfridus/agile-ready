import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getNeo4jDriver } from "@/lib/neo4j";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Users, CheckCircle, TrendingUp, Lightbulb, Target } from "lucide-react";
import { redirect } from "next/navigation";
import { OrgChart } from "@/components/OrgChart";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const driver = getNeo4jDriver();
  const dbSession = driver.session();

  let totalEmployees = 0;
  let completedAssessments = 0;
  let results: any[] = [];
  let avgSaaf = 0;
  let avgAi = 0;

  try {
    const dbResult = await dbSession.run(
      `
      MATCH (emp:User {role: 'employee'})-[:BELONGS_TO]->(c:Company {companyCode: $companyCode})
      OPTIONAL MATCH (emp)-[:SUBMITTED]->(s:Submission)
      OPTIONAL MATCH (s)-[:HAS_RESPONSE]->(r:Response)-[:ANSWERS]->(q:Question)
      WITH emp, s, q.type AS qType, sum(r.score) AS rawScore
      WITH emp, s, 
           sum(CASE WHEN qType = 'SAAF' THEN rawScore ELSE 0 END) AS saafScore,
           sum(CASE WHEN qType = 'AI' THEN rawScore ELSE 0 END) AS aiScore
      RETURN emp.username AS username, 
             emp.name AS name,
             emp.nip AS nip,
             emp.division AS division,
             s IS NOT NULL AS hasSubmitted, 
             saafScore, 
             aiScore
      ORDER BY emp.name ASC
      `,
      { companyCode: session.user.companyCode }
    );

    let totalSaafPercent = 0;
    let totalAiPercent = 0;

    results = dbResult.records.map(record => {
      const hasSubmitted = record.get("hasSubmitted");
      const saafScore = record.get("saafScore").toNumber();
      const aiScore = record.get("aiScore").toNumber();

      const saafPercent = hasSubmitted ? (saafScore / 225) * 100 : 0;
      const aiPercent = hasSubmitted ? (aiScore / 50) * 100 : 0;

      totalEmployees++;
      if (hasSubmitted) {
        completedAssessments++;
        totalSaafPercent += saafPercent;
        totalAiPercent += aiPercent;
      }

      return {
        username: record.get("username"),
        name: record.get("name") || record.get("username"),
        nip: record.get("nip") || "-",
        division: record.get("division") || "-",
        hasSubmitted,
        saafPercent,
        aiPercent,
      };
    });

    if (completedAssessments > 0) {
      avgSaaf = totalSaafPercent / completedAssessments;
      avgAi = totalAiPercent / completedAssessments;
    }

  } finally {
    await dbSession.close();
  }

  const completionRate = totalEmployees > 0
    ? Math.round((completedAssessments / totalEmployees) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name}. Here&apos;s an overview of your organization.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {/* Company Code Card */}
        <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tracking-widest text-primary">
              {session.user.companyCode || "------"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Share this code with your employees to allow them to log in.
            </p>
          </CardContent>
        </Card>

        {/* Dynamic Stat Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Registered in your company</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAssessments}</div>
            <p className="text-xs text-muted-foreground">{completionRate}% completion rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Aggregated Organization Stats */}
        <Card className="md:col-span-1 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Organization Average
            </CardTitle>
            <CardDescription>Overall aggregated scores for the entire company.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg SAAF Score</p>
                <div className="text-3xl font-bold text-orange-500">{avgSaaf.toFixed(1)}%</div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg AI Readiness</p>
                <div className="text-3xl font-bold text-blue-500">{avgAi.toFixed(1)}%</div>
              </div>
            </div>
            {/* The Chart */}
            <OrgChart saaf={avgSaaf} ai={avgAi} />
          </CardContent>
        </Card>

        {/* Detailed Results Table */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Employee Results</CardTitle>
            <CardDescription>Individual assessment submissions and scores.</CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No employees found.
              </div>
            ) : (
              <div className="max-h-[500px] overflow-auto border rounded-md relative">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>NIP</TableHead>
                      <TableHead>Divisi</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>SAAF Score</TableHead>
                      <TableHead>AI Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.username}>
                        <TableCell className="font-medium">{result.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{result.nip}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{result.division}</TableCell>
                        <TableCell>
                          <Badge className={result.hasSubmitted ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"}>
                            {result.hasSubmitted ? "Completed" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {result.hasSubmitted ? (
                            <span className="font-mono">{result.saafPercent.toFixed(1)}%</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {result.hasSubmitted ? (
                            <span className="font-mono">{result.aiPercent.toFixed(1)}%</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
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

      {/* Rekomendasi Strategis Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Rekomendasi Strategis (Berdasarkan Data)
            </CardTitle>
            <CardDescription>
              Langkah apa yang harus diambil perusahaan dan dari mana memulai implementasi Agile Scrum.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border border-border p-4 rounded-lg">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                Status Perusahaan Saat Ini
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Berdasarkan rata-rata SAAF organisasi <strong>({avgSaaf.toFixed(1)}%)</strong>, perusahaan Anda berada pada fase 
                {avgSaaf < 50 ? " Awal (Beginner)" : avgSaaf < 80 ? " Transisi (Intermediate)" : " Lanjutan (Advanced)"}. 
                {avgSaaf < 50 
                  ? " Karyawan masih membutuhkan pemahaman dasar tentang Agile. Fokus utama adalah edukasi dan pelatihan fundamental Scrum."
                  : avgSaaf < 80 
                  ? " Karyawan sudah memiliki pemahaman dasar, namun budaya Agile belum sepenuhnya berakar. Fokus utama adalah praktik nyata dan pembentukan 'Agile Mindset' (empowerment & kolaborasi), bukan sekadar menjalankan meeting/rutinitas."
                  : " Karyawan sudah sangat memahami dan menjalankan Agile dengan baik. Fokus utama adalah skala implementasi dan continuous improvement."
                }
              </p>

              <div>
                <h4 className="text-sm font-semibold mb-2">Panduan Fase Kematangan Agile (SAAF):</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className={`p-3 border rounded-md transition-colors ${avgSaaf < 50 ? "border-primary bg-primary/5" : "bg-card"}`}>
                    <div className="font-medium text-foreground">1. Fase Awal (Beginner)</div>
                    <div className="text-muted-foreground mb-1">Skor: 0% - 49.9%</div>
                    <p className="text-xs text-muted-foreground">Fokus pada edukasi dan kesadaran dasar tentang Agile.</p>
                  </div>
                  <div className={`p-3 border rounded-md transition-colors ${avgSaaf >= 50 && avgSaaf < 80 ? "border-primary bg-primary/5" : "bg-card"}`}>
                    <div className="font-medium text-foreground">2. Fase Transisi (Intermediate)</div>
                    <div className="text-muted-foreground mb-1">Skor: 50% - 79.9%</div>
                    <p className="text-xs text-muted-foreground">Fokus pada praktik nyata (pilot tim) & Agile mindset.</p>
                  </div>
                  <div className={`p-3 border rounded-md transition-colors ${avgSaaf >= 80 ? "border-primary bg-primary/5" : "bg-card"}`}>
                    <div className="font-medium text-foreground">3. Fase Lanjutan (Advanced)</div>
                    <div className="text-muted-foreground mb-1">Skor: 80% - 100%</div>
                    <p className="text-xs text-muted-foreground">Fokus pada skala organisasi & continuous improvement.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Mulai dari Mana Implementasi Scrum?</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-md p-4 bg-card hover:bg-muted/50 transition-colors">
                  <div className="font-medium text-primary mb-1">1. Analisis Level Divisi</div>
                  <p className="text-sm text-muted-foreground">
                    Lihat tabel <strong>Employee Results</strong> di atas. Identifikasi divisi dengan skor SAAF tertinggi untuk dijadikan <em>Pilot Project</em> percontohan, dan berikan <em>coaching</em> lebih pada divisi dengan skor terendah.
                  </p>
                </div>
                <div className="border rounded-md p-4 bg-card hover:bg-muted/50 transition-colors">
                  <div className="font-medium text-primary mb-1">2. Bentuk "Pilot Scrum Team"</div>
                  <p className="text-sm text-muted-foreground">
                    Jangan ubah seluruh perusahaan sekaligus. Bentuk 1 tim kecil (3-9 orang) yang bersifat <em>cross-functional</em>. Tentukan 1 Product Owner, 1 Scrum Master, dan Tim Eksekusi.
                  </p>
                </div>
                <div className="border rounded-md p-4 bg-card hover:bg-muted/50 transition-colors">
                  <div className="font-medium text-primary mb-1">3. Terapkan 4 Rutinitas Dasar (Ceremonies)</div>
                  <p className="text-sm text-muted-foreground">
                    Jalankan siklus kerja berdurasi tetap (Sprint, misal 2 minggu). Lakukan: <em>Sprint Planning, Daily Standup (max 15 menit), Sprint Review, dan Sprint Retrospective.</em>
                  </p>
                </div>
                <div className="border rounded-md p-4 bg-card hover:bg-muted/50 transition-colors">
                  <div className="font-medium text-primary mb-1">4. Gunakan Tools Visual & AI</div>
                  <p className="text-sm text-muted-foreground">
                    Manfaatkan skor AI Readiness yang baik ({avgAi.toFixed(1)}%). Gunakan <em>Kanban/Scrum Board</em> (To Do, In Progress, Done) dan optimalkan AI (seperti GitHub Copilot atau ChatGPT) untuk akselerasi kerja tim.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formula & Calculation Example Section */}
      <div className="mt-8">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="formula" className="border rounded-xl px-6 py-2 bg-card text-card-foreground shadow-sm">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="text-left">
                <div className="text-xl font-bold leading-none tracking-tight">Cara Perhitungan Skor (Assessment Formula)</div>
                <div className="text-sm text-muted-foreground mt-1.5 font-normal">
                  Penjelasan langkah demi langkah bagaimana sistem menghitung skor SAAF dan AI Readiness secara otomatis.
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6 border-t mt-2">
              <div className="space-y-6 pt-2">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* SAAF Formula */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-8 h-8 rounded-full flex items-center justify-center mr-2">1</span>
                      SAAF Metrics (Agile)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Terdapat <strong>45 Pertanyaan</strong> mengenai Agile. Setiap pertanyaan bernilai 1 hingga 5 poin.
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-md font-mono text-sm border">
                      <p>Poin Maksimal = 45 soal × 5 poin = 225 Poin</p>
                      <p className="mt-2 font-bold text-foreground">Rumus: (Total Poin Diperoleh ÷ 225) × 100%</p>
                    </div>
                  </div>

                  {/* AI Formula */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-8 h-8 rounded-full flex items-center justify-center mr-2">2</span>
                      AI Readiness
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Terdapat <strong>10 Pertanyaan</strong> mengenai Kesiapan AI. Setiap pertanyaan bernilai 1 hingga 5 poin.
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-md font-mono text-sm border">
                      <p>Poin Maksimal = 10 soal × 5 poin = 50 Poin</p>
                      <p className="mt-2 font-bold text-foreground">Rumus: (Total Poin Diperoleh ÷ 50) × 100%</p>
                    </div>
                  </div>
                </div>

                <hr className="border-border" />

                {/* E2E Example */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sample Perhitungan (Step-by-Step)</h3>
                  <div className="bg-slate-50 dark:bg-slate-900/50 border p-6 rounded-xl space-y-4 text-sm">
                    <p><strong>Kasus:</strong> Budi (Employee) mengisi assessment.</p>

                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      <div className="border-l-2 border-slate-300 pl-4 space-y-2">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300">Menghitung Nilai Budi:</h4>
                        <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                          <li>Dari 45 soal SAAF, Budi sebagian besar memilih "Setuju" (4 poin) dan "Netral" (3 poin).</li>
                          <li>Sistem menjumlahkan poinnya, misal total poin Budi adalah <strong>180</strong>.</li>
                          <li>Skor Persentase SAAF Budi = <span className="font-mono font-medium bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-foreground">(180 ÷ 225) × 100 = 80%</span></li>
                        </ul>
                      </div>

                      <div className="border-l-2 border-slate-300 pl-4 space-y-2">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300">Menghitung Rata-Rata Organisasi:</h4>
                        <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                          <li>Nilai SAAF Budi = 80%. Nilai SAAF Siti = 60%.</li>
                          <li>Hanya ada 2 karyawan yang sudah "Completed".</li>
                          <li>Nilai Organisasi = <span className="font-mono font-medium bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-foreground">(80% + 60%) ÷ 2 orang = 70%</span></li>
                          <li>Angka 70% inilah yang muncul di kolom <strong>Organization Average</strong> di atas.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

    </div>
  );
}
