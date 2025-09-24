
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WhatsAppIcon } from "./ui/whatsapp-icon";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useAuth } from "@/hooks/use-auth";
import type { IOrder } from "@/models/order.model";
import { toast } from "react-toastify";

type HelpTopic = "order" | "payment" | "general";

export function WhatsAppSupport() {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState<HelpTopic>("general");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [userOrders, setUserOrders] = useState<IOrder[]>([]);

  const whatsappNumber = "919545617458";

  useEffect(() => {
    const fetchOrders = async () => {
      if (user && token) {
        try {
          const response = await fetch('/api/user/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setUserOrders(data.orders || []);
          }
        } catch (error) {
          console.error("Failed to fetch user orders for support", error);
        }
      }
    };
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen, user, token]);

  const handleSend = () => {
    let finalMessage = "";
    switch (topic) {
        case "order":
            if (!selectedOrderId) {
                toast.error("Please select an order.");
                return;
            }
            finalMessage = `Hello, I need help with my order.\n\nOrder ID: ${selectedOrderId}\n\nMy issue is: ${message}`;
            break;
        case "payment":
             if (!message) {
                toast.error("Please describe your payment issue.");
                return;
            }
            finalMessage = `Hello, I have a payment query.\n\nDetails: ${message}`;
            break;
        case "general":
        default:
             if (!message) {
                toast.error("Please enter your question.");
                return;
            }
            finalMessage = `Hello, I have a question: ${message}`;
            break;
    }
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(finalMessage)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    // Reset form
    setTopic("general");
    setSelectedOrderId("");
    setMessage("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 focus:ring-4 focus:ring-green-300"
          aria-label="Contact us on WhatsApp"
        >
          <WhatsAppIcon className="h-8 w-8" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>How can we help?</DialogTitle>
          <DialogDescription>
            Provide some details so we can assist you faster.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="topic" className="text-right">
              Topic
            </Label>
            <Select onValueChange={(value) => setTopic(value as HelpTopic)} defaultValue={topic}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Inquiry</SelectItem>
                <SelectItem value="order">Order Issue</SelectItem>
                <SelectItem value="payment">Payment Problem</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {topic === 'order' && (
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="order-id" className="text-right">
                    Order
                </Label>
                 <Select onValueChange={setSelectedOrderId} value={selectedOrderId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select your order" />
                  </SelectTrigger>
                  <SelectContent>
                    {userOrders.length > 0 ? (
                        userOrders.map(order => (
                            <SelectItem key={order._id as string} value={order._id as string}>
                                Order #{(order._id as string).slice(-6).toUpperCase()}
                            </SelectItem>
                        ))
                    ) : (
                        <div className="p-2 text-sm text-muted-foreground">No recent orders found.</div>
                    )}
                  </SelectContent>
                </Select>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="message" className="text-right">
              Message
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                topic === 'order' ? 'Please describe the issue with your order...' : 
                topic === 'payment' ? 'Please provide transaction details or describe the issue...' : 
                'What is your question?'
              }
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSend}>Send on WhatsApp</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
