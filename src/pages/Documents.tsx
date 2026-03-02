import { FileText, Eye, Download } from "lucide-react";
import Header from "@/components/Header";
import { toast } from "@/hooks/use-toast";

const documents = [
  { name: "Aadhaar Card", type: "Identity", issued: "2019-03-15" },
  { name: "Ration Card (BPL)", type: "Subsidy", issued: "2021-07-20" },
  { name: "Voter ID", type: "Identity", issued: "2018-11-01" },
  { name: "PM-KISAN Certificate", type: "Agriculture", issued: "2023-04-10" },
];

const Documents = () => {
  const handleView = (name: string) => {
    toast({
      title: `Viewing ${name}`,
      description: "Document preview is not available yet. Please scan a BharatQR card first.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="section-title">Documents (DigiLocker)</h2>
        </div>
        <div className="space-y-3">
          {documents.map((doc, i) => (
            <div
              key={doc.name}
              className="card-gov p-4 flex items-center justify-between animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.type} · Issued {doc.issued}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleView(doc.name)}
                  className="rounded-md p-2 hover:bg-accent transition-colors"
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </button>
                <button className="rounded-md p-2 hover:bg-accent transition-colors">
                  <Download className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Documents;
