
"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Loader } from "@/components/ui/loader";
import { Landmark, Save, UploadCloud, ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { parseLegalDocument } from "@/ai/flows/parse-legal-doc-flow";

// Define types and constants directly in the client component
const legalDocTypes = [
    'about-us', 
    'contact-us', 
    'privacy-policy', 
    'terms-and-conditions', 
    'refund-policy', 
    'shipping-policy',
    'return-policy'
] as const;

type LegalDocType = typeof legalDocTypes[number];

interface ILegal {
  _id: string;
  docType: LegalDocType;
  title: string;
  content: string;
}

const docTypeLabels: Record<LegalDocType, string> = {
    'about-us': 'About Us',
    'contact-us': 'Contact Us',
    'privacy-policy': 'Privacy Policy',
    'terms-and-conditions': 'Terms & Conditions',
    'refund-policy': 'Refund / Cancellation Policy',
    'shipping-policy': 'Shipping / Delivery Policy',
    'return-policy': 'Return Policy'
};

export default function LegalsPage() {
  const router = useRouter();
  const [activeDocType, setActiveDocType] = useState<LegalDocType>('about-us');
  const [documents, setDocuments] = useState<Record<string, Partial<ILegal>>>({});
  const [loading, setLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/legals`);
      if (!response.ok) throw new Error("Failed to fetch documents");
      const { documents: fetchedDocs } = await response.json();
      
      const docsMap: Record<string, Partial<ILegal>> = {};
      fetchedDocs.forEach((doc: ILegal) => {
        docsMap[doc.docType] = doc;
      });
      setDocuments(docsMap);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSave = () => {
    const currentDoc = documents[activeDocType];
    if (!currentDoc || !currentDoc.content) {
        toast.warning("No content to save.");
        return;
    }

    startTransition(async () => {
        try {
            const payload = {
                docType: activeDocType,
                title: docTypeLabels[activeDocType],
                content: currentDoc.content,
            };
            const response = await fetch('/api/legals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            toast.success("Document saved successfully!");
            // Refresh local state with saved doc
            setDocuments(prev => ({
                ...prev,
                [activeDocType]: result.document,
            }));
        } catch (error: any) {
            toast.error(error.message);
        }
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocuments(prev => ({
        ...prev,
        [activeDocType]: {
            ...prev[activeDocType],
            content: e.target.value,
        }
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // We only support plain text files for now for simplicity
    if (file.type !== 'text/plain') {
        toast.error("Please upload a plain text file (.txt).");
        return;
    }

    setIsParsing(true);
    toast.info("Parsing document with AI...");
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const textContent = e.target?.result as string;
            if (!textContent) {
                throw new Error("Could not read file content.");
            }

            const result = await parseLegalDocument({
                documentContent: textContent,
                documentType: docTypeLabels[activeDocType],
            });
            
            setDocuments(prev => ({
                ...prev,
                [activeDocType]: {
                    ...prev[activeDocType],
                    content: result.htmlContent,
                }
            }));
            
            toast.success("Document parsed successfully!");

        } catch (error: any) {
            console.error("Parsing Error:", error);
            toast.error(error.message || "Failed to parse document.");
        } finally {
            setIsParsing(false);
            if(fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset file input
            }
        }
    };
    reader.readAsText(file);
  };

  const currentContent = documents[activeDocType]?.content || '';

  return (
    <div className="space-y-4">
        <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-xl font-bold flex items-center gap-2"><Landmark /> Legal Documents</h1>
        </div>
        <Card>
        <CardHeader>
            <CardTitle>Manage Legal Pages</CardTitle>
            <CardDescription>
            Manage the global legal pages for the entire platform.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Document Type:</span>
                <Select value={activeDocType} onValueChange={(val) => setActiveDocType(val as any)}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a document type" />
                </SelectTrigger>
                <SelectContent>
                    {legalDocTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                        {docTypeLabels[type]}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={isParsing}>
                    {(isParsing || isPending) && <Loader className="mr-2" />}
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload & Parse
                </Button>
                <input 
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".txt" // For now, only accept text files.
                />
                <Button onClick={handleSave} disabled={isPending || isParsing}>
                    {(isPending || isParsing) && <Loader className="mr-2" />}
                    <Save className="mr-2 h-4 w-4" /> Save Document
                </Button>
            </div>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader className="h-8 w-8 text-primary" />
                </div>
            ) : (
                <div>
                    <label htmlFor="content-editor" className="text-sm font-medium">
                        Content (HTML is supported)
                    </label>
                    <Textarea
                        id="content-editor"
                        value={currentContent}
                        onChange={handleContentChange}
                        placeholder={`Enter content for ${docTypeLabels[activeDocType]}...`}
                        className="mt-2 h-96 font-mono text-sm"
                        disabled={isParsing}
                    />
                </div>
            )}
        </CardContent>
        </Card>
    </div>
  );
}
