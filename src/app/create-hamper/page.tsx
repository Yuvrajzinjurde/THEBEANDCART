
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import useHamperStore from "@/stores/hamper-store";
import type { IBox, IBoxVariant } from "@/models/box.model";
import type { IProduct } from "@/models/product.model";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { ArrowLeft, ArrowRight, Check, CheckCircle, Package, Sparkles, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrandProductCard } from "@/components/brand-product-card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";

const TOTAL_STEPS = 4;

const occasionOptions = [
    { name: "Birthday", image: "https://picsum.photos/seed/bday-hamper/400/300", hint: "birthday cake" },
    { name: "Anniversary", image: "https://picsum.photos/seed/anniv-hamper/400/300", hint: "couple celebration" },
    { name: "Apology", image: "https://picsum.photos/seed/sorry-hamper/400/300", hint: "sad puppy" },
    { name: "Get Well Soon", image: "https://picsum.photos/seed/getwell-hamper/400/300", hint: "herbal tea" },
    { name: "Thank You", image: "https://picsum.photos/seed/thanks-hamper/400/300", hint: "thank you card" },
    { name: "Congratulations", image: "https://picsum.photos/seed/congrats-hamper/400/300", hint: "graduation cap" },
    { name: "Festive (Diwali)", image: "https://picsum.photos/seed/diwali-hamper/400/300", hint: "diya lamp" },
    { name: "Corporate Gift", image: "https://picsum.photos/seed/corp-hamper/400/300", hint: "office desk" },
];

const Step1_Occasion = () => {
    const { occasion, setOccasion } = useHamperStore();
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CardHeader>
                <CardTitle>What's the Occasion?</CardTitle>
                <CardDescription>Selecting a theme helps us give you better suggestions.</CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup value={occasion} onValueChange={setOccasion} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {occasionOptions.map(opt => (
                        <div key={opt.name}>
                            <RadioGroupItem value={opt.name} id={opt.name} className="sr-only" />
                            <Label htmlFor={opt.name} className={cn("block rounded-lg border-2 p-2 cursor-pointer", occasion === opt.name ? "border-primary shadow-md" : "border-muted")}>
                                <div className="aspect-video relative mb-2">
                                    <Image src={opt.image} alt={opt.name} fill className="object-cover rounded-md" data-ai-hint={opt.hint} />
                                </div>
                                <p className="font-semibold text-center">{opt.name}</p>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
        </motion.div>
    );
};

const Step2_Box = () => {
    const { box, boxVariant, setBox } = useHamperStore();
    const [allBoxes, setAllBoxes] = useState<IBox[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBoxes() {
            try {
                const res = await fetch('/api/boxes');
                if (res.ok) {
                    const data = await res.json();
                    setAllBoxes(data.boxes);
                }
            } catch (error) {
                console.error("Failed to fetch boxes", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBoxes();
    }, []);

    const selectedBoxId = box?._id;
    const selectedVariantId = `${box?._id}-${boxVariant?.name}`;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CardHeader>
                <CardTitle>Choose Your Box</CardTitle>
                <CardDescription>Select the perfect vessel for your gifts. Free options are available!</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? <Loader /> : (
                    <div className="space-y-6">
                        {allBoxes.map(b => (
                            <div key={b._id as string}>
                                <h3 className="font-bold text-lg mb-2">{b.name}</h3>
                                <RadioGroup onValueChange={(val) => {
                                    const [bId, vName] = val.split('-');
                                    const selectedB = allBoxes.find(b => b._id === bId);
                                    const selectedV = selectedB?.variants.find(v => v.name === vName);
                                    if(selectedB && selectedV) setBox(selectedB, selectedV);
                                }} 
                                value={box?._id === b._id ? selectedVariantId : undefined}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {b.variants.map(v => (
                                        <div key={`${b._id}-${v.name}`}>
                                            <RadioGroupItem value={`${b._id}-${v.name}`} id={`${b._id}-${v.name}`} className="sr-only" />
                                            <Label htmlFor={`${b._id}-${v.name}`} className={cn("block rounded-lg border-2 p-2 cursor-pointer h-full", selectedVariantId === `${b._id}-${v.name}` ? "border-primary" : "border-muted")}>
                                                <div className="aspect-square relative mb-2">
                                                    <Image src={v.images[0]} alt={v.name} fill className="object-cover rounded-md" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-semibold">{v.name}</p>
                                                    <p className="text-sm text-muted-foreground">{v.price > 0 ? `₹${v.price}` : 'Free'}</p>
                                                </div>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </motion.div>
    );
};

const Step3_Products = () => {
    const { products: hamperProducts, addProduct, removeProduct } = useHamperStore();
    const [allProducts, setAllProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const productResponse = await fetch(`/api/products`);
                if (productResponse.ok) {
                    const productData = await productResponse.json();
                    setAllProducts(productData.products);
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);
    
    const hamperProductIds = hamperProducts.map(p => p._id);
    const availableProducts = allProducts.filter(p => !hamperProductIds.includes(p._id));

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <CardHeader className="px-0">
                    <CardTitle>Fill Your Hamper</CardTitle>
                    <CardDescription>Browse and select products from any brand to add to your hamper.</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    {loading ? <Loader /> : (
                        <ScrollArea className="h-[600px] pr-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {availableProducts.map(p => (
                                    <div key={p._id as string} className="relative group">
                                        <BrandProductCard product={p} />
                                        <Button size="sm" className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100" onClick={() => addProduct(p)}>Add</Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </div>
             <div className="md:col-span-1">
                <CardHeader className="px-0">
                    <CardTitle>Your Hamper</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    <ScrollArea className="h-[600px] border rounded-lg p-4 bg-muted/30">
                        {hamperProducts.length > 0 ? (
                            <div className="space-y-4">
                                {hamperProducts.map(p => (
                                    <div key={p._id as string} className="flex items-center gap-4 bg-background p-2 rounded-md shadow-sm">
                                        <Image src={p.images[0]} alt={p.name} width={48} height={48} className="rounded-md object-cover" />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm line-clamp-1">{p.name}</p>
                                            <p className="text-xs text-muted-foreground">₹{p.sellingPrice}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeProduct(p._id as string)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                <Package className="h-12 w-12 mb-2" />
                                <p>Your hamper is empty</p>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </div>
        </motion.div>
    );
};

const Step4_Notes = () => {
    const { occasion, notesToCreator, notesToReceiver, addRose, setNotes, setAddRose } = useHamperStore();
    const [suggestion, setSuggestion] = useState({ shouldSuggest: false, suggestionText: '' });
    const [loadingSuggestion, setLoadingSuggestion] = useState(true);

    useEffect(() => {
        async function getSuggestion() {
            if (!occasion) return;
            setLoadingSuggestion(true);
            try {
                const res = await fetch('/api/hampers/suggest-rose', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ occasion }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setSuggestion(data);
                }
            } catch (error) {
                console.error("Failed to get suggestion", error);
            } finally {
                setLoadingSuggestion(false);
            }
        }
        getSuggestion();
    }, [occasion]);
    
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CardHeader>
                <CardTitle>Add a Personal Touch</CardTitle>
                <CardDescription>Include messages and special requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {loadingSuggestion ? <Loader/> : suggestion.shouldSuggest && (
                    <Card className="p-4 flex items-center justify-between bg-primary/10 border-primary/30">
                        <div className="flex items-center gap-4">
                            <Sparkles className="h-8 w-8 text-primary" />
                            <div>
                                <p className="font-semibold">Make it memorable</p>
                                <p className="text-sm text-muted-foreground">{suggestion.suggestionText}</p>
                            </div>
                        </div>
                        <Switch checked={addRose} onCheckedChange={setAddRose} />
                    </Card>
                )}

                <div>
                    <Label htmlFor="notes-receiver">Message for Recipient</Label>
                    <Textarea 
                        id="notes-receiver"
                        placeholder="Happy Birthday! Hope you have a great day."
                        className="mt-2"
                        value={notesToReceiver}
                        onChange={(e) => setNotes({ receiver: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="notes-creator">Special Instructions for Us</Label>
                    <Textarea 
                        id="notes-creator"
                        placeholder="Please use the blue ribbon for wrapping."
                        className="mt-2"
                        value={notesToCreator}
                        onChange={(e) => setNotes({ creator: e.target.value })}
                    />
                </div>
            </CardContent>
        </motion.div>
    );
};


export default function CreateHamperPage() {
    const router = useRouter();
    const { user, loading: authLoading, token } = useAuth();
    
    const { step, setStep, reset: resetHamper, ...hamperState } = useHamperStore();

    useEffect(() => {
        if (!authLoading && !user) {
            toast.info("Please log in to create a hamper.");
            router.replace(`/reeva/login`); // Default to a brand login page
        }
    }, [user, authLoading, router]);
    
    // Persist progress to backend on state change
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (user && token && hamperState.occasion) { // Only save if started
                const dataToSave = {
                    occasion: hamperState.occasion,
                    boxId: hamperState.box?._id,
                    boxVariantId: hamperState.boxVariant?._id,
                    products: hamperState.products.map(p => p._id),
                    notesToCreator: hamperState.notesToCreator,
                    notesToReceiver: hamperState.notesToReceiver,
                };
                try {
                    await fetch('/api/hampers', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(dataToSave)
                    });
                } catch (error) {
                    console.error("Failed to save hamper progress", error);
                }
            }
        }, 1000); // Debounce saves
        return () => clearTimeout(handler);
    }, [hamperState, token, user]);


    const isNextDisabled = () => {
        switch(step) {
            case 1: return !hamperState.occasion;
            case 2: return !hamperState.box || !hamperState.boxVariant;
            case 3: return hamperState.products.length === 0;
            default: return false;
        }
    }
    
    const renderStep = () => {
        switch(step) {
            case 1: return <Step1_Occasion />;
            case 2: return <Step2_Box />;
            case 3: return <Step3_Products />;
            case 4: return <Step4_Notes />;
            default: return null;
        }
    }

    if (authLoading || !user) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader className="h-12 w-12"/></div>
    }

    return (
        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="space-y-4 mb-8">
                    <h1 className="text-3xl font-bold text-center">Create Your Perfect Hamper</h1>
                    <Progress value={(step / TOTAL_STEPS) * 100} className="w-full h-2" />
                </div>

                <Card>
                    <AnimatePresence mode="wait">
                        <motion.div key={step}>
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>
                </Card>

                <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1}>
                        <ArrowLeft className="mr-2 h-4 w-4"/> Previous
                    </Button>
                    {step < TOTAL_STEPS ? (
                        <Button onClick={() => setStep(step + 1)} disabled={isNextDisabled()}>
                            Next <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    ) : (
                        <Button onClick={() => alert("Checkout!")}>
                           <CheckCircle className="mr-2 h-4 w-4" /> Review & Checkout
                        </Button>
                    )}
                </div>
                 <div className="text-center mt-4">
                    <Button variant="link" className="text-destructive" onClick={() => {
                        if (window.confirm("Are you sure you want to discard this hamper and start over?")) {
                            resetHamper();
                        }
                    }}>Discard and Start Over</Button>
                </div>
            </div>
        </main>
    );
}
