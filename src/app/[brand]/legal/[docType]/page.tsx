"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader } from '@/components/ui/loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// This is defined here to avoid importing server-side code from the model
interface ILegal {
  _id: string;
  docType: string;
  title: string;
  content: string;
}

export default function LegalPage() {
  const params = useParams();
  const brandName = params.brand as string;
  const docType = params.docType as string;

  const [document, setDocument] = useState<ILegal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docType) return;

    const fetchDocument = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the global document by its type, ignoring the brand
        const response = await fetch(`/api/legals?docType=${docType}`);
        if (!response.ok) {
          throw new Error('Failed to fetch legal document');
        }
        const data = await response.json();
        if (data.documents.length === 0) {
            throw new Error('Document not found');
        }
        setDocument(data.documents[0]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [docType]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Loader className="h-12 w-12" />
      </main>
    );
  }

  if (error || !document) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Document Not Found</h1>
        <p className="text-muted-foreground">{error || `The requested document could not be found.`}</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
       <Card>
        <CardHeader>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={brandName ? `/${brandName}/home` : '/'}>Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{document.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
             <CardTitle className="mt-4">{document.title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div 
                className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: document.content }}
            />
        </CardContent>
      </Card>
    </main>
  );
}
