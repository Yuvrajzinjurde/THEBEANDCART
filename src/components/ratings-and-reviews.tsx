

"use client";

import React, { useState } from 'react';
import { Star, ThumbsUp, MoreVertical, Smile, CheckCircle2, UploadCloud, X } from 'lucide-react';
import type { IReview } from '@/models/review.model';
import type { ReviewStats } from '@/app/api/reviews/[productId]/stats/route';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Separator } from './ui/separator';
import { format, parseISO } from 'date-fns';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader } from './ui/loader';
import { cn } from '@/lib/utils';


const ASPECT_TAGS = ['Look', 'Colour', 'Comfort', 'Material Quality', 'Light Weight', 'True to Specs'];

const ReviewForm = ({ productId, onCancel, onSubmitSuccess }: { productId: string, onCancel: () => void, onSubmitSuccess: (newReview: IReview) => void }) => {
    const { user, token } = useAuth();
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const filePromises = Array.from(files).slice(0, 4 - images.length).map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                });
            });
            Promise.all(filePromises).then(newFiles => {
                setImages(prev => [...prev, ...newFiles]);
            });
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("You must be logged in to submit a review.");
            router.push('/login');
            return;
        }
        if (rating === 0) {
            toast.warn("Please select a rating.");
            return;
        }
        if (!reviewText.trim()) {
            toast.warn("Please write a review.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId,
                    rating,
                    reviewText,
                    images,
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit review.');
            }
            toast.success("Review submitted successfully!");
            onSubmitSuccess(result.review);

        } catch (error: any) {
            console.error("Review submission error:", error);
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            <div className="space-y-6">
                <div>
                    <Label>Your Rating*</Label>
                    <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={cn("h-8 w-8 cursor-pointer", star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <Label htmlFor="review-text">Your Review*</Label>
                    <Textarea 
                        id="review-text"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your thoughts on the product..."
                        className="mt-2"
                        required
                    />
                </div>

                <div>
                    <Label>Upload Photos (up to 4)</Label>
                     <div className="mt-2 flex items-center gap-4">
                        {images.map((img, index) => (
                            <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden">
                                <Image src={img} alt={`upload preview ${index}`} fill className="object-cover"/>
                                <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-5 w-5" onClick={() => removeImage(index)}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                        {images.length < 4 && (
                             <label htmlFor="image-upload" className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                <UploadCloud className="w-8 h-8 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground mt-1">Upload</span>
                                <Input id="image-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                            </label>
                        )}
                    </div>
                </div>
                
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader className="mr-2" />}
                        Submit Review
                    </Button>
                </div>
            </div>
        </form>
    );
};

interface RatingsAndReviewsProps {
  productId: string;
  reviewStats: ReviewStats;
  reviews: IReview[];
}

export default function RatingsAndReviews({ productId, reviewStats: initialReviewStats, reviews: initialReviews }: RatingsAndReviewsProps) {
    const { token } = useAuth();
    const [isWritingReview, setIsWritingReview] = useState(false);
    const [reviews, setReviews] = useState(initialReviews);
    const [reviewStats, setReviewStats] = useState(initialReviewStats);
    
    const allReviewImages = reviews.flatMap(r => r.images || []);
    
    const handleLike = async (reviewId: string) => {
        try {
            const response = await fetch(`/api/reviews/${reviewId}/like`, { 
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to like review');
            const { review: updatedReview } = await response.json();
            setReviews(prev =>
                prev.map(r => r._id === reviewId ? updatedReview : r)
            );
        } catch (error) {
            console.error(error);
            toast.error("Could not update like.");
        }
    };


    const handleReviewSubmit = (newReview: IReview) => {
        setReviews(prev => [newReview, ...prev].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 10));
        setReviewStats(prev => ({
            totalRatings: prev.totalRatings + 1,
            totalReviews: newReview.review ? prev.totalReviews + 1 : prev.totalReviews,
            averageRating: (prev.averageRating * prev.totalRatings + newReview.rating) / (prev.totalRatings + 1),
        }));
        setIsWritingReview(false);
    };

    return (
    <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className='flex items-center gap-4'>
                <h2 className="text-xl font-bold">Ratings &amp; Reviews</h2>
                {reviewStats.totalRatings > 0 && (
                     <div className="flex items-center gap-2">
                        <Badge className="flex items-center gap-1 text-base bg-green-600 hover:bg-green-700">
                            <span>{reviewStats.averageRating.toFixed(1)}</span>
                            <Star className="w-3.5 h-3.5 fill-white" />
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            {reviewStats.totalRatings.toLocaleString()} ratings and {reviewStats.totalReviews.toLocaleString()} reviews
                        </span>
                    </div>
                )}
            </div>
            {!isWritingReview && (
                <Button variant="outline" onClick={() => setIsWritingReview(true)}>Rate Product</Button>
            )}
        </div>
        
        {isWritingReview && (
            <ReviewForm 
                productId={productId} 
                onCancel={() => setIsWritingReview(false)} 
                onSubmitSuccess={handleReviewSubmit}
            />
        )}

        {reviews.length > 0 && !isWritingReview && (
            <>
                <Separator className='my-6'/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold mb-3">What our customers felt:</h3>
                        <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-2 p-2 border rounded-md bg-green-50 text-green-800">
                                <Smile className="h-5 w-5" />
                                <span className="font-medium text-sm">Positive</span>
                            </div>
                            {ASPECT_TAGS.map(tag => (
                                <Button key={tag} variant="outline" className="font-normal">{tag}</Button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3">Images uploaded by customers:</h3>
                        {allReviewImages.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {allReviewImages.slice(0, 4).map((img, index) => (
                                    <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden">
                                        <Image src={img} alt={`Customer image ${index+1}`} fill className="object-cover" />
                                    </div>
                                ))}
                                {allReviewImages.length > 4 && (
                                    <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center text-lg font-bold">
                                        +{allReviewImages.length - 4}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No images uploaded yet.</p>
                        )}
                    </div>
                </div>

                <Separator className='my-6'/>

                <div className='space-y-8'>
                    {reviews.map(review => (
                        <div key={review._id as string}>
                            <div className="flex items-center gap-2">
                                <Badge className="flex items-center gap-1 text-base bg-green-600 hover:bg-green-700">
                                    <span>{review.rating}</span>
                                    <Star className="w-3 h-3 fill-white" />
                                </Badge>
                                <h4 className="font-semibold">{review.review}</h4>
                            </div>
                            
                            {review.images && review.images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3 pl-10">
                                    {review.images.map((img, index) => (
                                        <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden">
                                            <Image src={img} alt={`Review image ${index+1}`} fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between mt-3 pl-10">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className='font-medium text-foreground'>{review.userName}</span>
                                    <span>{format(parseISO(review.createdAt as string), 'MMM, yyyy')}</span>
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span>Certified Buyer, Bangalore Division</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                     <button className="flex items-center gap-1 text-muted-foreground hover:text-primary" onClick={() => handleLike(review._id as string)}><ThumbsUp className="h-4 w-4" /> {review.likes > 0 ? review.likes : ''}</button>
                                    <button className="text-muted-foreground hover:text-primary"><MoreVertical className="h-4 w-4" /></button>
                                </div>
                            </div>
                            <Separator className="mt-8" />
                        </div>
                    ))}
                </div>
            </>
        )}
    </div>
  );
}
