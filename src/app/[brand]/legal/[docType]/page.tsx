
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader } from '@/components/ui/loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/header';

// This is defined here to avoid importing server-side code from the model
interface ILegal {
  _id: string;
  docType: string;
  title: string;
  content: string;
}

export default function LegalPage() {
  const params = useParams();
  const router = useRouter();
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
      <main className="container flex min-h-screen flex-col items-center justify-center px-10">
        <Loader className="h-12 w-12" />
      </main>
    );
  }

  if (error || !document) {
    return (
      <main className="container flex min-h-screen flex-col items-center justify-center px-10">
        <h1 className="text-2xl font-bold">Document Not Found</h1>
        <p className="text-muted-foreground">{error || `The requested document could not be found.`}</p>
         <Button variant="link" onClick={() => router.back()}>Go Back</Button>
      </main>
    );
  }

  return (
    <>
    <Header />
    <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 px-10">
        <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
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
        </div>
       <Card>
        <CardHeader>
             <CardTitle>{document.title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div 
                className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: document.content }}
            />
        </CardContent>
      </Card>
    </main>
    </>
  );
}
