"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MappingPage() {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pemetaan Framework (Mapping)</h1>
        <p className="text-muted-foreground mt-2 text-justify">
          Halaman ini menjabarkan dimensi, level kematangan, serta indikator utama yang kami gunakan dalam mengukur tingkat kesiapan Agile dan adopsi Artificial Intelligence di dalam organisasi.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 items-start">
        {/* SAAF Section */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/10">
            <CardTitle>Sidky Agile Adoption Framework (SAAF)</CardTitle>
            <CardDescription>5 Tahapan Evolusi Kematangan Agile</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Accordion type="multiple" className="w-full space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg px-4 shadow-sm">
                <AccordionTrigger className="hover:no-underline font-semibold">Level 1: Collaborative (Kolaboratif)</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-justify leading-relaxed pb-4 space-y-2">
                  <p><strong>Deskripsi:</strong> Membangun fondasi komunikasi, kepercayaan tim, dan menghancurkan sekat (silo) antar departemen.</p>
                  <p><strong>Argumen Pendukung:</strong> Tanpa komunikasi yang terbuka dan rasa aman secara psikologis, praktik teknis secanggih apapun (seperti CI/CD) tidak akan efektif karena akar masalah pengembangan biasanya terletak pada miskomunikasi terhadap kebutuhan bisnis.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="border rounded-lg px-4 shadow-sm">
                <AccordionTrigger className="hover:no-underline font-semibold">Level 2: Evolutionary (Evolusioner)</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-justify leading-relaxed pb-4 space-y-2">
                  <p><strong>Deskripsi:</strong> Tim mulai mampu mendeliver/mengirimkan perangkat lunak secara berkala, sering, dan dalam iterasi kecil (inkremental).</p>
                  <p><strong>Argumen Pendukung:</strong> Pengiriman nilai (value) secara dini sangat krusial untuk mengurangi risiko kegagalan proyek masif di akhir jadwal (Big Bang failure) dan memastikan organisasi mendapatkan <em>feedback</em> pasar sesegera mungkin.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="border rounded-lg px-4 shadow-sm">
                <AccordionTrigger className="hover:no-underline font-semibold">Level 3: Integrated (Terintegrasi)</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-justify leading-relaxed pb-4 space-y-2">
                  <p><strong>Deskripsi:</strong> Praktik rekayasa tingkat lanjut (Engineering Practices) seperti pengujian otomatis (Automated Testing) dan integrasi berkelanjutan (CI) distandardisasi.</p>
                  <p><strong>Argumen Pendukung:</strong> Tanpa otomatisasi dan jaminan stabilitas kode (build), pengiriman fitur secara cepat pada Level 2 justru berpotensi menumpuk "utang teknis" (technical debt) dan memicu banyak <em>bugs</em> di *production*.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="border rounded-lg px-4 shadow-sm">
                <AccordionTrigger className="hover:no-underline font-semibold">Level 4: Adaptive (Adaptif)</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-justify leading-relaxed pb-4 space-y-2">
                  <p><strong>Deskripsi:</strong> Organisasi memiliki kemampuan untuk bermanuver atau merespons perubahan arah bisnis secara instan dan fleksibel tanpa terikat pada rencana tahunan yang kaku.</p>
                  <p><strong>Argumen Pendukung:</strong> Keunggulan kompetitif di era digital yang sangat dinamis (VUCA) mengharuskan penyesuaian taktik bisnis dalam hitungan hari atau minggu, bukan lagi bulan atau tahun.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="border rounded-lg px-4 shadow-sm">
                <AccordionTrigger className="hover:no-underline font-semibold">Level 5: Encompassing (Penyeluruh)</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-justify leading-relaxed pb-4 space-y-2">
                  <p><strong>Deskripsi:</strong> Pola pikir (mindset) Agile tidak hanya eksklusif untuk tim IT/Engineering, melainkan juga menyebar ke divisi HR, Keuangan, Hukum, dan tingkat Eksekutif.</p>
                  <p><strong>Argumen Pendukung:</strong> <em>Agility</em> (ketangkasan) sebuah perusahaan secara utuh akan selalu membentur tembok (bottleneck) jika proses pengadaan, rekrutmen, atau pendanaannya masih terjebak pada birokrasi tradisional yang lambat.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* AI Readiness Section */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/10">
            <CardTitle>AI Readiness Metrics</CardTitle>
            <CardDescription>Pilar Utama Integrasi Kecerdasan Buatan (AI)</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Accordion type="multiple" className="w-full space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg px-4 shadow-sm">
                <AccordionTrigger className="hover:no-underline font-semibold">1. Infrastruktur & Manajemen Data</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-justify leading-relaxed pb-4 space-y-2">
                  <p><strong>Deskripsi:</strong> Ketersediaan daya komputasi, kebersihan pipa data (data pipeline), dan infrastruktur cloud yang andal untuk melatih maupun menjalankan model AI.</p>
                  <p><strong>Formula/Indikator Evaluasi:</strong> (Rasio Data Terstruktur vs Tidak Terstruktur) + (Kecepatan Akses / Latensi Pipeline).</p>
                  <p><strong>Argumen Pendukung:</strong> Pepatah klasik AI adalah <em>"Garbage In, Garbage Out"</em>. Sehebat apapun algoritma AI yang digunakan, hasilnya akan menyesatkan jika disuapi dengan data mentah yang kotor. Infrastruktur yang tangguh menjadi mutlak agar data bervolume besar dapat diproses secara <em>real-time</em>.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="border rounded-lg px-4 shadow-sm">
                <AccordionTrigger className="hover:no-underline font-semibold">2. Keterampilan & Budaya Inovasi</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-justify leading-relaxed pb-4 space-y-2">
                  <p><strong>Deskripsi:</strong> Tingkat literasi AI pada karyawan serta kultur perusahaan yang mendorong adopsi/eksperimentasi dengan alat Generative AI (seperti Copilot, ChatGPT, dll) dalam pekerjaan sehari-hari.</p>
                  <p><strong>Formula/Indikator Evaluasi:</strong> (Jumlah Insiden Penggunaan AI Aktif per Bulan) / (Total Karyawan) × 100%.</p>
                  <p><strong>Argumen Pendukung:</strong> Transformasi AI pada dasarnya adalah transformasi manusia (<em>people problem</em>). Karyawan yang merasa terancam akan posisinya akan melakukan resistensi pasif. Organisasi wajib memberikan edukasi bahwa AI berfungsi sebagai "Co-pilot" yang ditugaskan untuk melipatgandakan produktivitas, bukan menggantikan kreativitas manusia.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="border rounded-lg px-4 shadow-sm">
                <AccordionTrigger className="hover:no-underline font-semibold">3. Etika, Kebijakan, & Tata Kelola</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-justify leading-relaxed pb-4 space-y-2">
                  <p><strong>Deskripsi:</strong> Keberadaan pedoman internal tertulis mengenai mitigasi bias AI, perlindungan privasi, serta aturan tegas terkait batas penggunaan AI yang diizinkan.</p>
                  <p><strong>Formula/Indikator Evaluasi:</strong> Persentase kepatuhan terhadap regulasi (seperti UU Pelindungan Data Pribadi / GDPR) dalam audit internal AI tahunan.</p>
                  <p><strong>Argumen Pendukung:</strong> Jika karyawan tanpa sadar menyalin kode pemrograman atau data sensitif klien ke platform AI publik (misalnya ChatGPT versi gratis), perusahaan bisa mengalami kebocoran <em>Intellectual Property</em> (IP). Kebijakan tata kelola mencegah kelalaian operasional yang dapat berakibat pada penuntutan hukum.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
