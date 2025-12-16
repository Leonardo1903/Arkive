import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";

export default function Stats() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-4xl font-bold md:text-5xl">
            Trusted by users worldwide
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Join thousands who&apos;ve made the switch to smarter storage
          </p>
        </div>

        {/* Statistics */}
        <div className="mx-auto mb-20 grid max-w-5xl gap-8 md:grid-cols-4">
          <Card className="border-2 p-8 text-center transition-all hover:scale-105 hover:shadow-xl">
            <div className="mb-2 text-4xl font-bold text-primary">10K+</div>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </Card>
          <Card className="border-2 p-8 text-center transition-all hover:scale-105 hover:shadow-xl">
            <div className="mb-2 text-4xl font-bold text-primary">50M+</div>
            <p className="text-sm text-muted-foreground">Files Stored</p>
          </Card>
          <Card className="border-2 p-8 text-center transition-all hover:scale-105 hover:shadow-xl">
            <div className="mb-2 text-4xl font-bold text-primary">99.9%</div>
            <p className="text-sm text-muted-foreground">Uptime</p>
          </Card>
          <Card className="border-2 p-8 text-center transition-all hover:scale-105 hover:shadow-xl">
            <div className="mb-2 text-4xl font-bold text-primary">24/7</div>
            <p className="text-sm text-muted-foreground">Support</p>
          </Card>
        </div>

        {/* File Types Supported */}
        <div className="mx-auto max-w-4xl">
          <h3 className="mb-8 text-center text-2xl font-bold">
            Support for all your files
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="group border-2 p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-primary/20 p-3 border-2 border-primary/40">
                  <Upload className="h-6 w-6 text-primary" strokeWidth={2.5} />
                </div>
                <h4 className="font-semibold">Documents</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                PDF, DOCX, XLSX, TXT, and more
              </p>
            </Card>
            <Card className="group border-2 p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-chart-4/30 p-3 border-2 border-chart-4/50">
                  <Upload className="h-6 w-6 text-chart-4" strokeWidth={2.5} />
                </div>
                <h4 className="font-semibold">Images</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                JPG, PNG, GIF, SVG, WebP
              </p>
            </Card>
            <Card className="group border-2 p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-chart-2/30 p-3 border-2 border-chart-2/50">
                  <Upload className="h-6 w-6 text-chart-2" strokeWidth={2.5} />
                </div>
                <h4 className="font-semibold">Videos</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                MP4, MOV, AVI, MKV, WebM
              </p>
            </Card>
            <Card className="group border-2 p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-chart-5/30 p-3 border-2 border-chart-5/50">
                  <Upload className="h-6 w-6 text-chart-5" strokeWidth={2.5} />
                </div>
                <h4 className="font-semibold">Archives</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                ZIP, RAR, 7Z, TAR
              </p>
            </Card>
            <Card className="group border-2 p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-chart-3/30 p-3 border-2 border-chart-3/50">
                  <Upload className="h-6 w-6 text-chart-3" strokeWidth={2.5} />
                </div>
                <h4 className="font-semibold">Audio</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                MP3, WAV, FLAC, AAC
              </p>
            </Card>
            <Card className="group border-2 p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-chart-1/30 p-3 border-2 border-chart-1/50">
                  <Upload className="h-6 w-6 text-chart-1" strokeWidth={2.5} />
                </div>
                <h4 className="font-semibold">And More</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Any file type you need
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
