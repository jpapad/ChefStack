import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: number; // e.g., 16/9, 4/3, 1
  loading?: 'lazy' | 'eager';
  blur?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = '/placeholder-recipe.jpg',
  aspectRatio,
  loading = 'lazy',
  blur = true,
  className = '',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false); // Give fallback a chance
    } else {
      setHasError(true);
      setIsLoading(false);
    }
    onError?.();
  };

  const containerStyle: React.CSSProperties = aspectRatio
    ? { paddingBottom: `${(1 / aspectRatio) * 100}%`, position: 'relative' }
    : {};

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={containerStyle}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <Icon name="image" className="w-12 h-12 mb-2" />
          <span className="text-sm">Δεν βρέθηκε εικόνα</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={containerStyle}>
      {isLoading && blur && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`${aspectRatio ? 'absolute inset-0 w-full h-full' : 'w-full h-full'} object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon name="loader-2" className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
};

// Responsive image with srcset support
interface ResponsiveImageProps extends OptimizedImageProps {
  srcSet?: string;
  sizes?: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  srcSet,
  sizes,
  ...props
}) => {
  return (
    <OptimizedImage
      {...props}
      srcSet={srcSet}
      sizes={sizes}
    />
  );
};

// Avatar image with fallback to initials
interface AvatarImageProps extends Omit<OptimizedImageProps, 'alt'> {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  name,
  src,
  size = 'md',
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl'
  };

  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (hasError || !src) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-brand-yellow to-amber-500 flex items-center justify-center font-bold text-dark-bg ${className}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
      <OptimizedImage
        src={src}
        alt={name}
        onError={() => setHasError(true)}
        aspectRatio={1}
        {...props}
      />
    </div>
  );
};

// Recipe image with placeholder
export const RecipeImage: React.FC<Omit<OptimizedImageProps, 'fallbackSrc'>> = (props) => {
  return (
    <OptimizedImage
      fallbackSrc="/placeholder-recipe.jpg"
      aspectRatio={4 / 3}
      {...props}
    />
  );
};

// Product/Ingredient image
export const ProductImage: React.FC<Omit<OptimizedImageProps, 'fallbackSrc'>> = (props) => {
  return (
    <OptimizedImage
      fallbackSrc="/placeholder-ingredient.jpg"
      aspectRatio={1}
      {...props}
    />
  );
};
