
"use client";

import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, MoreVertical, Smile, CheckCircle2, UploadCloud, X } from 'lucide-react';
import type { IReview } from '@/models/review.model';
import type { ReviewStats } from '@/app/api/reviews/[productId]/stats/route';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Separator } from './ui/separator';
import { format, parseISO } from 'date-fns';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

interface RatingsAndReviewsProps {
  productId: string;
  reviewStats: ReviewStats;
  reviews: IReview[];
}

const ASPECT_TAGS = ['Look', 'Colour', 'Comfort', 'Material Quality', 'Light Weight', 'True to Specs'];

const ReviewForm = ({ productId, onCancel }: { productId: string, onCancel: () => void }) => {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [images, setImages] = useState<string[]>([]);
    
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

    return (
        <div className="mt-6 border-t pt-6">
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
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button>Submit Review</Button>
                </div>
            </div>
        </div>
    );
};


export default function RatingsAndReviews({ productId, reviewStats, reviews }: RatingsAndReviewsProps) {
    const [isWritingReview, setIsWritingReview] = useState(false);
    const allReviewImages = reviews.flatMap(r => r.images || []);

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
            <ReviewForm productId={productId} onCancel={() => setIsWritingReview(false)} />
        )}

        {reviewStats.totalRatings > 0 && !isWritingReview && (
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
                                    <button className="flex items-center gap-1 text-muted-foreground hover:text-primary"><ThumbsUp className="h-4 w-4" /> {Math.floor(Math.random() * 500)}</button>
                                    <button className="flex items-center gap-1 text-muted-foreground hover:text-primary"><ThumbsDown className="h-4 w-4" /> {Math.floor(Math.random() * 200)}</button>
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

    