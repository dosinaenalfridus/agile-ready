"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export function UserGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <BookOpen className="w-4 h-4" />
          User Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AgileReady User Guide</DialogTitle>
          <DialogDescription>
            Follow these instructions to get started with your organization's assessment.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="register" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="register">Register Admin</TabsTrigger>
            <TabsTrigger value="login">Login Employee</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="register" className="mt-4 space-y-2">
            <h3 className="text-lg font-medium text-primary">Cara Setup Perusahaan (Admin)</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Klik tombol <strong>Register Company</strong> di halaman utama.</li>
              <li>Isi Nama Perusahaan, Username Admin, dan Kata Sandi.</li>
              <li>Sistem akan menghasilkan 6 digit rahasia <strong>Company Code</strong>.</li>
              <li>Login menggunakan akun Admin tersebut untuk masuk ke Dashboard.</li>
              <li>Di menu <strong>Employees</strong>, tambahkan akun karyawan secara manual atau massal via unggahan CSV.</li>
            </ol>
          </TabsContent>
          
          <TabsContent value="login" className="mt-4 space-y-2">
            <h3 className="text-lg font-medium text-primary">Cara Login Karyawan</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Dapatkan <strong>Company Code</strong>, <strong>Username</strong>, dan <strong>Password</strong> dari Admin Perusahaan Anda (Default kata sandi biasanya <code className="bg-muted px-1 py-0.5 rounded">password123</code>).</li>
              <li>Klik tombol <strong>Employee</strong> di halaman utama.</li>
              <li>Masukkan <strong>Company Code</strong> untuk memverifikasi entitas perusahaan Anda.</li>
              <li>Masukkan Username dan Password untuk mengakses panel Anda.</li>
            </ol>
          </TabsContent>

          <TabsContent value="assessment" className="mt-4 space-y-2">
            <h3 className="text-lg font-medium text-primary">Cara Mengisi Assessment</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Di menu sisi kiri (sidebar), klik <strong>Assessment</strong>.</li>
              <li>Anda akan disajikan 45 pertanyaan SAAF (Agile) dan 10 pertanyaan AI Readiness.</li>
              <li>Baca penjelasan prinsip/faktor yang muncul (kotak oranye/biru) untuk memahami konteks pertanyaan.</li>
              <li>Pilih tingkat kesesuaian/kematangan (Level 1 hingga 5).</li>
              <li>Klik <strong>Submit</strong>. Skor otomatis terhitung dan muncul di Dashboard Admin.</li>
            </ol>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
