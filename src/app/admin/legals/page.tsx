"use client";

import { useState, useEffect, useTransition } from "react";
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
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/loader";
import { legalDocTypes, type ILegal } from "@/models/legal.model";
import { Landmark, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const docTypeLabels: Record<typeof legalDocTypes[number], string> = {
    'about-us': 'About Us',
    'contact-us': 'Contact Us',
    'privacy-policy': 'Privacy Policy',
    'terms-and-conditions': 'Terms & Conditions',
    'refund-policy': 'Refund / Cancellation Policy',
    'shipping-policy': 'Shipping / Delivery Policy'
};

export default function LegalsPage() {
  const [activeDocType, setActiveDocType] = useState<typeof legalDocTypes[number]>('about-us');
  const [documents, setDocuments] = useState<Record<string, Partial<ILegal>>>({});
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

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
        toast.warn("No content to save.");
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

  const currentContent = documents[activeDocType]?.content || '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Landmark />
            Legal Documents
        </CardTitle>
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
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader className="mr-2" />}
            <Save className="mr-2 h-4 w-4" /> Save Document
          </Button>
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
                />
            </div>
        )}
      </CardContent>
    </Card>
  );
}
