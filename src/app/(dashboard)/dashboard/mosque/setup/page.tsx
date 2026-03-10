import {
  getMosqueByUser,
  createOrUpdateMosque,
} from "@/lib/actions/mosque";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function MosqueSetupPage() {
  const mosque = await getMosqueByUser();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mosque ? "Edit Masjid" : "Daftarkan Masjid"}</CardTitle>
        <CardDescription>
          {mosque
            ? "Perbarui informasi masjid Anda"
            : "Isi informasi dasar masjid Anda untuk memulai"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createOrUpdateMosque} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Masjid *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={mosque?.name || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Input
              id="address"
              name="address"
              defaultValue={mosque?.address || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Kota</Label>
            <Input
              id="city"
              name="city"
              defaultValue={mosque?.city || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactWhatsapp">Nomor WhatsApp</Label>
            <Input
              id="contactWhatsapp"
              name="contactWhatsapp"
              defaultValue={mosque?.contactWhatsapp || ""}
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi Singkat (opsional)</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={mosque?.description || ""}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {mosque ? "Simpan Perubahan" : "Daftarkan Masjid"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
