
import React from 'react';
import { Review } from '../types';
import StarRating from './StarRating';

interface ReviewListProps {
    reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-slate-500 dark:text-slate-400">Be the first to review this product!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    <img src={review.userAvatar} alt={review.userName} className="w-12 h-12 rounded-full flex-shrink-0" />
                    <div className="flex-grow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-slate-800 dark:text-slate-200">{review.userName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(review.date).toLocaleDateString()}</p>
                            </div>
                            <StarRating rating={review.rating} size="w-5 h-5" />
                        </div>
                        <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed">{review.comment}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
