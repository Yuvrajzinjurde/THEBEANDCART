

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import useHamperStore from "@/stores/hamper-store";
import type { IBox, IBoxVariant } from "@/models/box.model";
import type { IProduct } from "@/models/product.model";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { ArrowLeft, ArrowRight, CheckCircle, Package, Sparkles, Trash2, Twitter, Facebook, Instagram, Linkedin, Bot, Heart, ShoppingCart, Home } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { HamperProgressBar } from "@/components/hamper-progress-bar";
import usePlatformSettingsStore from "@/stores/platform-settings-store";
import { Separator } from "@/components/ui/separator";
import useUserStore from '@/stores/user-store';

const TOTAL_STEPS = 5;

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

const BoxItem = ({ box, variant, onLike, isSelected }: { box: IBox, variant: IBoxVariant, onLike: (boxId: string) => void, isSelected: boolean }) => {
    const hasDiscount = variant.mrp > variant.sellingPrice;
    const discountPercentage = hasDiscount ? Math.round(((variant.mrp - variant.sellingPrice) / variant.mrp) * 100) : 0;
    
    return (
        <div>
            <RadioGroupItem value={`${box._id}-${variant._id}`} id={`${box._id}-${variant._id}`} className="sr-only" />
            <Label htmlFor={`${box._id}-${variant._id}`} className={cn("block rounded-lg border-2 p-2 cursor-pointer h-full transition-all duration-300 ease-in-out hover:border-foreground/20 hover:shadow-lg", isSelected ? "border-primary ring-2 ring-primary/50" : "border-muted")}>
                <div className="relative group/card">
                    <div className="aspect-square relative mb-2">
                        <Image src={variant.images[0]} alt={variant.name} fill className="object-cover rounded-md" />
                    </div>
                    <Button 
                        size="icon" 
                        variant="secondary"
                        className="absolute top-1 right-1 h-7 w-7 rounded-full z-10 opacity-0 group-hover/card:opacity-100"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLike(box._id as string); }}
                    >
                        <Heart className="h-4 w-4" />
                    </Button>
                </div>
                <div className="text-center space-y-1">
                    <p className="font-semibold truncate">{box.name} ({variant.name})</p>
                    <Badge variant="outline" className="capitalize">{box.boxType}</Badge>
                    <div className="flex items-baseline justify-center gap-2 flex-wrap min-h-[20px]">
                        <p className="text-sm font-bold text-foreground">₹{variant.sellingPrice.toLocaleString('en-IN')}</p>
                        {hasDiscount && (
                            <>
                                <p className="text-xs font-medium text-muted-foreground line-through">₹{variant.mrp.toLocaleString('en-IN')}</p>
                                <p className="text-xs font-semibold text-green-600">{discountPercentage}% off</p>
                            </>
                        )}
                    </div>
                </div>
            </Label>
        </div>
    )
};


const Step2_Box = () => {
    const { occasion, box: selectedBox, boxVariant: selectedBoxVariant, setBox } = useHamperStore();
    const [allBoxes, setAllBoxes] = useState<IBox[]>([]);
    const [suggestedBoxIds, setSuggestedBoxIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const { settings } = usePlatformSettingsStore();
    const aiEnabled = settings.aiEnabled;

    const handleSelect = (value: string) => {
        const [boxId, variantId] = value.split('-');
        const box = allBoxes.find(b => b._id.toString() === boxId);
        if (box) {
            const variant = box.variants.find(v => v._id.toString() === variantId);
            if (variant) {
                setBox(box, variant);
            }
        }
    };

    useEffect(() => {
        const fetchAndSuggest = async () => {
            setLoading(true);
            try {
                // 1. Fetch all packages
                const res = await fetch('/api/boxes');
                if (!res.ok) throw new Error("Failed to fetch boxes");
                const { boxes: fetchedPackages } = await res.json();
                
                // 2. Filter for only 'box' type
                const boxesOnly = fetchedPackages.filter((p: IBox) => p.boxType === 'box');
                setAllBoxes(boxesOnly);
                
                // 3. If occasion, boxes, and AI are available, get AI suggestions
                if (aiEnabled && occasion && boxesOnly.length > 0) {
                    const packageList = boxesOnly.map((b: IBox) => ({ id: b._id.toString(), name: b.name, description: b.description, type: b.boxType }));
                    const suggestionRes = await fetch('/api/hampers/suggest-boxes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ occasion, boxes: packageList }),
                    });
                    if (suggestionRes.ok) {
                        const suggestionData = await suggestionRes.json();
                        setSuggestedBoxIds(suggestionData.suggestedBoxIds);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch boxes or suggestions", error);
                toast.error("Could not load packaging options.");
            } finally {
                setLoading(false);
            }
        };
        fetchAndSuggest();
    }, [occasion, aiEnabled]);
    
    const handleLike = async (boxId: string) => {
        try {
            const response = await fetch(`/api/boxes/${boxId}`, { method: 'PATCH' });
            if (response.ok) {
                const { box: updatedBox } = await response.json();
                setAllBoxes(prev => prev.map(b => b._id === boxId ? { ...b, likes: updatedBox.likes } : b));
                toast.success('Thanks for your feedback!');
            }
        } catch (error) {
            console.error("Failed to like box", error);
        }
    };

    const selectedVariantId = selectedBox && selectedBoxVariant ? `${selectedBox._id}-${selectedBoxVariant._id}` : undefined;

    const suggestedBoxes = allBoxes
        .filter(b => suggestedBoxIds.includes(b._id as string))
        .sort((a, b) => suggestedBoxIds.indexOf(a._id as string) - suggestedBoxIds.indexOf(b._id as string));
        
    const otherBoxes = allBoxes.filter(b => !suggestedBoxIds.includes(b._id as string));

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CardHeader>
                <CardTitle>Choose Your Box</CardTitle>
                <CardDescription>Select the perfect vessel for your gifts.</CardDescription>
            </CardHeader>
            <CardContent>
                 <RadioGroup onValueChange={handleSelect} value={selectedVariantId} className="space-y-8">
                    {loading ? <Loader /> : (
                        <>
                            {suggestedBoxes.length > 0 && (
                                <section>
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Bot className="text-primary" /> AI Suggested for You</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {suggestedBoxes.flatMap(b => b.variants.map(v => (
                                            <BoxItem 
                                                key={`${b._id}-${v._id}`}
                                                box={b}
                                                variant={v}
                                                onLike={handleLike}
                                                isSelected={`${b._id}-${v._id}` === selectedVariantId}
                                            />
                                        )))}
                                    </div>
                                </section>
                            )}
                            
                            {otherBoxes.length > 0 && (
                                <section>
                                    <h3 className="font-bold text-lg mb-4">All Boxes</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {otherBoxes.flatMap(b => b.variants.map(v => (
                                            <BoxItem 
                                                key={`${b._id}-${v._id}`}
                                                box={b}
                                                variant={v}
                                                onLike={handleLike}
                                                isSelected={`${b._id}-${v._id}` === selectedVariantId}
                                            />
                                        )))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </RadioGroup>
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

const Step4_Bag = () => {
    const { bag: selectedBag, bagVariant: selectedBagVariant, setBag } = useHamperStore();
    const [allBags, setAllBags] = useState<IBox[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBags = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/boxes');
                if (!res.ok) throw new Error("Failed to fetch bags");
                const { boxes: fetchedPackages } = await res.json();
                
                const bagsOnly = fetchedPackages.filter((p: IBox) => p.boxType === 'bag');
                setAllBags(bagsOnly);
            } catch (error) {
                console.error("Failed to fetch bags", error);
                toast.error("Could not load bag options.");
            } finally {
                setLoading(false);
            }
        };
        fetchBags();
    }, []);

    const handleSelect = (value: string) => {
        const [bagId, variantId] = value.split('-');
        const bag = allBags.find(b => b._id.toString() === bagId);
        if (bag) {
            const variant = bag.variants.find(v => v._id.toString() === variantId);
            if (variant) {
                setBag(bag, variant);
            }
        }
    };
    
    const handleLike = async (bagId: string) => {
        try {
            const response = await fetch(`/api/boxes/${bagId}`, { method: 'PATCH' });
            if (response.ok) {
                const { box: updatedBag } = await response.json();
                setAllBags(prev => prev.map(b => b._id === bagId ? { ...b, likes: updatedBag.likes } : b));
                toast.success('Thanks for your feedback!');
            }
        } catch (error) {
            console.error("Failed to like bag", error);
        }
    };

    const selectedVariantId = selectedBag && selectedBagVariant ? `${selectedBag._id}-${selectedBagVariant._id}` : undefined;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CardHeader>
                <CardTitle>Choose Your Bag</CardTitle>
                <CardDescription>Select a bag for your hamper.</CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup onValueChange={handleSelect} value={selectedVariantId} className="space-y-8">
                    {loading ? <Loader /> : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {allBags.flatMap(b => b.variants.map(v => (
                                <BoxItem 
                                    key={`${b._id}-${v._id}`}
                                    box={b}
                                    variant={v}
                                    onLike={handleLike}
                                    isSelected={`${b._id}-${v._id}` === selectedVariantId}
                                />
                            )))}
                        </div>
                    )}
                </RadioGroup>
            </CardContent>
        </motion.div>
    );
};


const Step5_Notes = () => {
    const { occasion, products, notesToCreator, notesToReceiver, addRose, setNotes, setAddRose } = useHamperStore();
    const { settings } = usePlatformSettingsStore();
    const aiEnabled = settings.aiEnabled;
    const [roseSuggestion, setRoseSuggestion] = useState({ shouldSuggest: false, suggestionText: '' });
    const [loadingRoseSuggestion, setLoadingRoseSuggestion] = useState(true);
    const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);


    useEffect(() => {
        async function getRoseSuggestion() {
            if (!aiEnabled || !occasion) {
                 setLoadingRoseSuggestion(false);
                return;
            };
            setLoadingRoseSuggestion(true);
            try {
                const res = await fetch('/api/hampers/suggest-rose', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ occasion }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setRoseSuggestion(data);
                }
            } catch (error) {
                console.error("Failed to get rose suggestion", error);
            } finally {
                setLoadingRoseSuggestion(false);
            }
        }
        getRoseSuggestion();
    }, [occasion, aiEnabled]);
    
    const handleGenerateMessage = async () => {
        if (!occasion || products.length === 0) {
            toast.warn("Please select an occasion and add products to the hamper first.");
            return;
        }
        setIsGeneratingMessage(true);
        try {
            const productInfo = products.map(p => ({ name: p.name, description: p.description }));
            const res = await fetch('/api/hampers/suggest-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ occasion, products: productInfo }),
            });
            if (res.ok) {
                const data = await res.json();
                setNotes({ receiver: data.message });
                toast.success("AI message generated!");
            } else {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to get suggestion.");
            }
        } catch (error: any) {
            console.error("Failed to get message suggestion", error);
            toast.error(error.message || "Could not generate a message at this time.");
        } finally {
            setIsGeneratingMessage(false);
        }
    };
    
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CardHeader>
                <CardTitle>Add a Personal Touch</CardTitle>
                <CardDescription>Include messages and special requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {loadingRoseSuggestion ? <Loader/> : roseSuggestion.shouldSuggest && (
                    <Card className="p-4 flex items-center justify-between bg-primary/10 border-primary/30">
                        <div className="flex items-center gap-4">
                            <Sparkles className="h-8 w-8 text-primary" />
                            <div>
                                <p className="font-semibold">Make it memorable</p>
                                <p className="text-sm text-muted-foreground">{roseSuggestion.suggestionText}</p>
                            </div>
                        </div>
                        <Switch checked={addRose} onCheckedChange={setAddRose} />
                    </Card>
                )}

                <div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="notes-receiver">Message for Recipient</Label>
                         <Button type="button" variant="ghost" size="sm" onClick={handleGenerateMessage} disabled={!aiEnabled || isGeneratingMessage}>
                            {isGeneratingMessage ? <Loader className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Suggest with AI
                        </Button>
                    </div>
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
    const pathname = usePathname();
    const { user, loading: authLoading, token } = useAuth();
    
    const { step, setStep, reset: resetHamper, ...hamperState } = useHamperStore();
    const [isDiscarding, setIsDiscarding] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [discardAlertOpen, setDiscardAlertOpen] = useState(false);
    const [checkoutAlertOpen, setCheckoutAlertOpen] = useState(false);


    useEffect(() => {
        if (!authLoading && !user) {
            toast.info("Please log in to create a hamper.");
            router.replace(`/login?redirect=${pathname}`);
        }
    }, [user, authLoading, router, pathname]);
    
    // Persist progress to backend on state change
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (user && token && hamperState.occasion) { // Only save if started
                const dataToSave = {
                    occasion: hamperState.occasion,
                    boxId: hamperState.box?._id,
                    boxVariantId: hamperState.boxVariant?._id,
                    bagId: hamperState.bag?._id,
                    bagVariantId: hamperState.bagVariant?._id,
                    products: hamperState.products.map(p => p._id),
                    notesToCreator: hamperState.notesToCreator,
                    notesToReceiver: hamperState.notesToReceiver,
                    addRose: hamperState.addRose,
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
            case 4: return !hamperState.bag || !hamperState.bagVariant;
            default: return false;
        }
    }
    
    const handleDiscard = async () => {
        setDiscardAlertOpen(false);
        setIsDiscarding(true);
        try {
            if (token) {
                await fetch('/api/hampers', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
            }
            resetHamper();
            toast.success("Hamper discarded.");
        } catch (error) {
            console.error("Failed to discard hamper from server", error);
            toast.error("Could not discard hamper. Please try again.");
        } finally {
            setIsDiscarding(false);
        }
    };
    
    const handleCheckout = async () => {
        if (!token) return;
        setCheckoutAlertOpen(false);
        setIsCheckingOut(true);
        try {
            const response = await fetch('/api/hampers/checkout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to finalize hamper.");
            }
            
            const { cart } = await response.json();
            useUserStore.getState().setCart(cart);

            toast.success("Hamper finalized and added to cart!");
            resetHamper();
            router.push(`/cart`);
        } catch (error: any) {
            console.error("Checkout failed:", error);
            toast.error(error.message);
        } finally {
            setIsCheckingOut(false);
        }
    };

    const renderStep = () => {
        switch(step) {
            case 1: return <Step1_Occasion />;
            case 2: return <Step2_Box />;
            case 3: return <Step3_Products />;
            case 4: return <Step4_Bag />;
            case 5: return <Step5_Notes />;
            default: return null;
        }
    }

    if (authLoading || !user) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader className="h-12 w-12"/></div>
    }

    return (
        <>
        <div className="flex flex-col min-h-screen">
            <main className="container flex-grow py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto pb-24">
                     <div className="relative mb-8 flex items-center justify-between">
                        <Button variant="outline" size="icon" onClick={() => router.push('/')} className="hidden sm:inline-flex">
                            <Home className="h-4 w-4" />
                            <span className="sr-only">Back to Home</span>
                        </Button>
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm sm:max-w-md md:max-w-lg px-4">
                            <HamperProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
                        </div>
                    </div>

                    <Card>
                        <AnimatePresence mode="wait">
                            <motion.div key={step}>
                                {renderStep()}
                            </motion.div>
                        </AnimatePresence>
                    </Card>
                </div>
                <AlertDialog open={discardAlertOpen} onOpenChange={setDiscardAlertOpen}>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This will permanently discard your current hamper progress. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDiscard}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
            <footer className="sticky bottom-0 z-10 w-full bg-background/95 border-t backdrop-blur-sm">
                <div className="container flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                        <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1 || isDiscarding}>
                            <ArrowLeft className="mr-2 h-4 w-4"/> Previous
                        </Button>
                        
                        <div className="flex items-center gap-2">
                            {step > 1 && (
                                <Button variant="destructive" onClick={() => setDiscardAlertOpen(true)} disabled={isDiscarding}>
                                    {isDiscarding ? <Loader className="mr-2" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Start Over
                                </Button>
                            )}
                            {step < TOTAL_STEPS ? (
                                <Button onClick={() => setStep(step + 1)} disabled={isNextDisabled()}>
                                    Next <ArrowRight className="ml-2 h-4 w-4"/>
                                </Button>
                            ) : (
                                <AlertDialog open={checkoutAlertOpen} onOpenChange={setCheckoutAlertOpen}>
                                    <AlertDialogTrigger asChild>
                                        <Button disabled={isCheckingOut}>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Review & Checkout
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="max-w-lg w-full">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Your Hamper Summary</AlertDialogTitle>
                                            <AlertDialogDescription>Review your creation before adding it to your cart.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <ScrollArea className="max-h-[60vh] pr-4">
                                            <div className="space-y-4">
                                                <p><span className="font-semibold">Occasion:</span> {hamperState.occasion}</p>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    {hamperState.boxVariant && (
                                                        <Card>
                                                            <CardHeader className="p-3"><CardTitle className="text-base">Box</CardTitle></CardHeader>
                                                            <CardContent className="p-3 pt-0 flex flex-col items-center text-center">
                                                                <Image src={hamperState.boxVariant.images[0]} alt={hamperState.boxVariant.name} width={80} height={80} className="rounded-md object-cover mb-2" />
                                                                <p className="text-sm font-medium">{hamperState.box?.name} ({hamperState.boxVariant.name})</p>
                                                            </CardContent>
                                                        </Card>
                                                    )}
                                                    {hamperState.bagVariant && (
                                                        <Card>
                                                            <CardHeader className="p-3"><CardTitle className="text-base">Bag</CardTitle></CardHeader>
                                                            <CardContent className="p-3 pt-0 flex flex-col items-center text-center">
                                                                <Image src={hamperState.bagVariant.images[0]} alt={hamperState.bagVariant.name} width={80} height={80} className="rounded-md object-cover mb-2" />
                                                                <p className="text-sm font-medium">{hamperState.bag?.name} ({hamperState.bagVariant.name})</p>
                                                            </CardContent>
                                                        </Card>
                                                    )}
                                                </div>

                                                <Card>
                                                    <CardHeader className="p-3"><CardTitle className="text-base">Products Inside ({hamperState.products.length})</CardTitle></CardHeader>
                                                    <CardContent className="p-3 pt-0 space-y-2">
                                                        {hamperState.products.map(p => (
                                                            <div key={p._id as string} className="flex items-center gap-3 text-sm">
                                                                <Image src={p.images[0]} alt={p.name} width={32} height={32} className="rounded object-cover" />
                                                                <span className="truncate">{p.name}</span>
                                                            </div>
                                                        ))}
                                                    </CardContent>
                                                </Card>

                                                {hamperState.notesToReceiver && (
                                                    <Card>
                                                        <CardHeader className="p-3"><CardTitle className="text-base">Your Message</CardTitle></CardHeader>
                                                        <CardContent className="p-3 pt-0">
                                                            <p className="text-sm text-muted-foreground italic">&quot;{hamperState.notesToReceiver}&quot;</p>
                                                        </CardContent>
                                                    </Card>
                                                )}

                                            </div>
                                        </ScrollArea>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleCheckout} disabled={isCheckingOut}>
                                                {isCheckingOut ? <Loader className="mr-2" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                                                Add to Cart
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                </div>
            </footer>
        </div>
        </>
    );
}
