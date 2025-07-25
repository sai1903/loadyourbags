import React, { useState } from 'react';
import { StarIcon } from './Icons';

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    interactive?: boolean;
    size?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    onRatingChange,
    interactive = false,
    size = "w-6 h-6"
}) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleStarClick = (index: number) => {
        if (interactive && onRatingChange) {
            onRatingChange(index);
        }
    };
    
    const handleMouseEnter = (index: number) => {
        if (interactive) {
            setHoverRating(index);
        }
    };
    
    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    return (
        <div className="flex items-center" onMouseLeave={handleMouseLeave}>
            {[1, 2, 3, 4, 5].map((index) => {
                const isFilled = (hoverRating || rating) >= index;
                return (
                    <div
                        key={index}
                        onClick={() => handleStarClick(index)}
                        onMouseEnter={() => handleMouseEnter(index)}
                        className={interactive ? 'cursor-pointer' : ''}
                    >
                        <StarIcon
                            filled={isFilled}
                            className={`${size} ${isFilled ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default StarRating;