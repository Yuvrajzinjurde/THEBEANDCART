"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { WhatsAppIcon } from "./ui/whatsapp-icon";

export function WhatsAppSupport() {
  const whatsappNumber = "919545617458";
  const message = "Hello! I need some help.";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        asChild
        size="icon"
        className="w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 focus:ring-4 focus:ring-green-300"
      >
        <Link
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
            message
          )}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppIcon className="h-7 w-7" />
          <span className="sr-only">Contact us on WhatsApp</span>
        </Link>
      </Button>
    </div>
  );
}
