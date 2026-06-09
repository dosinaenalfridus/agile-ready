"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle2, Info, BookOpen } from "lucide-react";
type Question = {
  id: string;
  text: string;
  type: string;
  dimension: string;
};

const LABELS = [
  "Sangat Tidak Setuju",
  "Tidak Setuju",
  "Netral",
  "Setuju",
  "Sangat Setuju"
];

const AGILE_PRINCIPLES = [
  "Prioritas utama adalah memuaskan pelanggan melalui pengiriman perangkat lunak yang berharga secara dini dan berkelanjutan.",
  "Menerima perubahan kebutuhan, bahkan di akhir pengembangan. Proses Agile memanfaatkan perubahan untuk keuntungan kompetitif pelanggan.",
  "Mengirimkan perangkat lunak yang berfungsi secara rutin, dari hitungan minggu hingga bulan, dengan preferensi pada jangka waktu yang lebih pendek.",
  "Orang bisnis dan pengembang harus bekerja sama setiap hari sepanjang proyek.",
  "Bangun proyek di sekitar individu yang termotivasi. Berikan lingkungan dan dukungan yang mereka butuhkan, dan percayai mereka untuk menyelesaikan pekerjaan.",
  "Metode paling efisien dan efektif untuk menyampaikan informasi kepada dan di dalam tim pengembangan adalah percakapan tatap muka.",
  "Perangkat lunak yang berfungsi adalah ukuran utama kemajuan.",
  "Proses Agile mempromosikan pengembangan berkelanjutan. Sponsor, pengembang, dan pengguna harus dapat mempertahankan ritme yang konstan tanpa batas waktu.",
  "Perhatian terus-menerus pada keunggulan teknis dan desain yang baik meningkatkan ketangkasan (agility).",
  "Kesederhanaan—seni memaksimalkan jumlah pekerjaan yang TIDAK dilakukan—sangatlah penting.",
  "Arsitektur, kebutuhan, dan desain terbaik muncul dari tim yang mengatur dirinya sendiri (self-organizing teams).",
  "Secara berkala, tim merenungkan cara menjadi lebih efektif, kemudian menyesuaikan dan menyelaraskan perilakunya."
];

const AI_FACTORS = [
  "Infrastruktur data yang memadai dan tersentralisasi untuk memfasilitasi pelacakan dan pelatihan model AI.",
  "Tingkat literasi dasar AI secara merata di seluruh level karyawan (bukan hanya tim teknis).",
  "Keberadaan kebijakan perlindungan privasi saat memasukkan data rahasia perusahaan ke platform AI pihak ketiga.",
  "Akses terhadap komputasi cloud yang dapat diskalakan (scalable) untuk memproses beban kerja kecerdasan buatan.",
  "Penguasaan keterampilan 'Prompt Engineering' dasar untuk melipatgandakan efisiensi kerja sehari-hari.",
  "Panduan etika tertulis yang tegas terkait penggunaan AI, termasuk strategi pencegahan bias pada algoritma.",
  "Pipa data (Data Pipeline) yang terintegrasi otomatis untuk memastikan model AI memproses data terkini.",
  "Budaya internal yang mendorong eksplorasi alat bantu Generative AI secara mandiri tanpa takut melakukan kesalahan.",
  "Kesiapan infrastruktur keamanan siber (Cybersecurity) terhadap kerentanan baru yang ditimbulkan oleh model AI.",
  "Adanya satuan tugas atau tim tata kelola (Governance Team) khusus untuk memonitor dampak dan metrik kesuksesan AI."
];

export default function AssessmentPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Load saved progress
    const saved = localStorage.getItem("agileready_progress");
    if (saved) {
      setAnswers(JSON.parse(saved));
    }

    const fetchQuestions = async () => {
      try {
        const res = await fetch("/api/assessment");
        const data = await res.json();
        if (data.questions) {
          setQuestions(data.questions);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleSelect = (questionId: string, score: number) => {
    const newAnswers = { ...answers, [questionId]: score };
    setAnswers(newAnswers);
    localStorage.setItem("agileready_progress", JSON.stringify(newAnswers));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (res.ok) {
        setSubmitted(true);
        localStorage.removeItem("agileready_progress");
        window.scrollTo(0, 0);
      }
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No questions found. The admin needs to run the seed script.
        </CardContent>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto text-center py-16 mt-12">
        <CardContent className="space-y-6 flex flex-col items-center">
          <CheckCircle2 className="h-20 w-20 text-green-500 mb-4" />
          <h2 className="text-4xl font-bold">Assessment Selesai!</h2>
          <p className="text-lg text-muted-foreground">
            Terima kasih atas partisipasi Anda. Jawaban Anda telah tersimpan.
          </p>
          <Button onClick={() => router.push("/employee")} size="lg" className="mt-8">
            Kembali ke Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;
  const isComplete = answeredCount === questions.length;

  return (
    <div className="w-full max-w-full pb-32">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Educational Sidebar */}
        <div className="xl:col-span-4 xl:sticky xl:top-6 space-y-6">
          <Card className="shadow-md">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center text-lg">
                <BookOpen className="w-5 h-5 mr-2 text-foreground" />
                Apa itu Agile Scrum?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4 pt-4 text-muted-foreground text-justify leading-relaxed">
              <p>
                <strong className="text-foreground">Agile Scrum</strong> adalah kerangka kerja ringan yang membantu individu, tim, dan organisasi menghasilkan nilai tambah melalui solusi adaptif untuk masalah kompleks.
              </p>
              <div>
                <strong className="text-foreground">Tokoh Utama:</strong>
                <p>Ken Schwaber dan Jeff Sutherland, yang merumuskan panduan Scrum (Scrum Guide) pada awal 1990-an.</p>
              </div>
              <div>
                <strong className="text-foreground">Keunggulan:</strong>
                <ul className="list-disc pl-4 space-y-1 mt-1">
                  <li>Adaptasi cepat terhadap perubahan kebutuhan pasar atau klien.</li>
                  <li>Kolaborasi tim yang sangat transparan, mandiri (self-organizing), dan erat.</li>
                  <li>Penyampaian nilai yang berkelanjutan ke pelanggan melalui rilis inkremental.</li>
                  <li>Mitigasi risiko yang jauh lebih baik karena evaluasi dilakukan setiap iterasi.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center text-lg">
                <Info className="w-5 h-5 mr-2 text-foreground" />
                Mengenal SAAF
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4 pt-4 text-muted-foreground text-justify leading-relaxed">
              <p>
                <strong className="text-foreground">Sidky Agile Adoption Framework (SAAF)</strong> diciptakan oleh Dr. Ahmed Sidky sebagai panduan untuk mengadopsi Agile secara bertahap dan terukur.
              </p>
              <div>
                <strong className="text-foreground block mb-1">Mengapa terdapat 5 Level Kematangan?</strong>
                <p>Kelima level ini (Collaborative, Evolutionary, Integrated, Adaptive, Encompassing) dibuat agar organisasi tidak "kaget" atau menolak perubahan secara drastis. Setiap level mewakili tahapan adopsi praktik yang semakin kompleks, memastikan fondasi komunikasi yang kuat sebelum melangkah ke praktik rekayasa perangkat lunak tingkat lanjut.</p>
              </div>
              <div>
                <strong className="text-foreground block mb-1">Mengapa jumlah pertanyaan setiap level berbeda?</strong>
                <p>Setiap level dalam kerangka SAAF memiliki fokus dimensi yang berbeda (praktik, prinsip, nilai). Level awal seperti Collaborative mungkin memiliki lebih banyak pertanyaan karena berfokus pada pembangunan budaya dasar dan komunikasi tim. Sementara level lanjut memiliki pertanyaan yang lebih spesifik dan teknikal mengenai metrik dan respons bisnis.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Assessment Questions */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Header & Sticky Progress */}
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm px-4 md:px-6 rounded-lg mb-8">
            <div>
              <h1 className="text-2xl font-bold">Agile & AI Assessment</h1>
              <p className="text-sm text-muted-foreground">Jawab seluruh {questions.length} pertanyaan di bawah ini secara jujur.</p>
            </div>
            <div className="w-full sm:w-auto flex flex-col items-end">
              <span className="text-sm font-medium mb-1">
                Progress: {answeredCount} / {questions.length} ({Math.round(progress)}%)
              </span>
              <div className="w-full sm:w-64 h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Stacked Questions List */}
          <div className="space-y-8">
            {questions.map((q, index) => {
              const match = q.text.match(/ke-(\d+)/i);
              const itemIndex = match ? parseInt(match[1]) - 1 : -1;
              const isSAAF = q.type === "SAAF";
              const infoArray = isSAAF ? AGILE_PRINCIPLES : AI_FACTORS;
              
              const infoText = itemIndex >= 0 && itemIndex < infoArray.length 
                ? infoArray[itemIndex] 
                : null;

              const titleLabel = isSAAF ? `Prinsip Agile ke-${itemIndex + 1}` : `Faktor AI Readiness ke-${itemIndex + 1}`;
              const containerClass = isSAAF 
                ? "bg-orange-50/80 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-900"
                : "bg-blue-50/80 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900";
              const iconClass = isSAAF ? "text-orange-500" : "text-blue-500";
              const titleClass = isSAAF ? "text-orange-900 dark:text-orange-100" : "text-blue-900 dark:text-blue-100";

              return (
                <Card key={q.id} className="w-full border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 bg-muted/10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-md uppercase tracking-wide">
                        {q.type}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {q.dimension}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-medium leading-relaxed">
                      {index + 1}. {q.text}
                    </CardTitle>
                    {infoText && (
                      <div className={`mt-4 border p-3 rounded-lg text-sm flex gap-3 items-start ${containerClass}`}>
                        <Info className={`w-5 h-5 shrink-0 mt-0.5 ${iconClass}`} />
                        <div>
                          <strong className={`block mb-0.5 ${titleClass}`}>
                            Info: {titleLabel}
                          </strong>
                          <p className="leading-relaxed">{infoText}</p>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {[1, 2, 3, 4, 5].map((score) => {
                        const isSelected = answers[q.id] === score;
                        return (
                          <button
                            key={score}
                            onClick={() => handleSelect(q.id, score)}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary shadow-sm border-primary"
                                : "border-muted bg-background hover:border-primary/50"
                            }`}
                          >
                            <span className="text-2xl font-bold">{score}</span>
                            <span className="text-xs font-semibold text-center leading-tight">
                              {LABELS[score - 1]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

        </div>
      </div>

      {/* Submit Section (Floating Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t flex justify-center z-50">
        <Button 
          size="lg" 
          className="w-full max-w-2xl text-lg h-14 shadow-xl" 
          onClick={handleSubmit} 
          disabled={!isComplete || submitting}
        >
          {submitting 
            ? "Menyimpan Jawaban..." 
            : isComplete 
              ? "Kirim Assessment" 
              : `Selesaikan ${questions.length - answeredCount} pertanyaan lagi untuk mengirim`
          }
        </Button>
      </div>
    </div>
  );
}
