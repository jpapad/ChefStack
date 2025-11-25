import React, { useState } from 'react';
import { Icon } from './Icon';

interface StarRatingProps {
  rating: number; // Current rating (0-5)
  onRate?: (rating: number) => void; // Optional callback for interactive rating
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showCount?: boolean;
  count?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRate,
  size = 'md',
  readonly = false,
  showCount = false,
  count
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSize = sizeClasses[size];
  const isInteractive = !readonly && onRate;

  const handleClick = (value: number) => {
    if (isInteractive && onRate) {
      onRate(value);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      <div 
        className="flex items-center gap-1 px-1"
        onMouseLeave={() => isInteractive && setHoverRating(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          const isHalfFilled = !isFilled && star - 0.5 <= displayRating;

          return (
            <button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              onMouseEnter={() => isInteractive && setHoverRating(star)}
              className={`${
                isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              } transition-all duration-200`}
              disabled={!isInteractive}
            >
              {isFilled ? (
                <Icon
                  name="star"
                  className={`${iconSize} text-slate-900 dark:text-yellow-400 fill-current drop-shadow-sm`}
                />
              ) : isHalfFilled ? (
                <div className="relative">
                  <Icon
                    name="star"
                    className={`${iconSize} text-gray-300 dark:text-gray-600`}
                  />
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Icon
                      name="star"
                      className={`${iconSize} text-slate-900 dark:text-yellow-400 fill-current`}
                    />
                  </div>
                </div>
              ) : (
                <Icon
                  name="star"
                  className={`${iconSize} text-gray-300 dark:text-gray-600 transition-all`}
                />
              )}
            </button>
          );
        })}
      </div>
      
      {showCount && count !== undefined && count > 0 && (
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
          ({count})
        </span>
      )}
      
      {!readonly && rating > 0 && (
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
