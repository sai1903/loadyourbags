
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import { Review } from '../types';
import StarRating from './StarRating';

interface ReviewFormProps {
    productId: string;
    onReviewSubmitted: (review: Review) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewSubmitted }) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError("You must be logged in to leave a review.");
            return;
        }
        if (rating === 0) {
            setError("Please select a star rating.");
            return;
        }
        if (comment.trim() === '') {
            setError("Please write a comment.");
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            const reviewData = {
                userId: user.id,
                userName: user.name,
                userAvatar: user.avatar,
                rating,
                comment,
            };
            const updatedProduct = await apiService.addReview(productId, reviewData);
            // The API returns the whole product, but we just need the new review
            const newReview = updatedProduct.reviews[0]; 
            onReviewSubmitted(newReview);
            // Reset form
            setRating(0);
            setComment('');
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not submit review.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border dark:border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Write a Review</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">You've purchased this item. Share your thoughts!</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Rating</label>
                    <StarRating rating={rating} onRatingChange={setRating} interactive size="w-8 h-8"/>
                </div>
                 <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Comment</label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="What did you like or dislike? How did you use this product?"
                    />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="text-right">
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 disabled:bg-primary-400 transition-colors">
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
