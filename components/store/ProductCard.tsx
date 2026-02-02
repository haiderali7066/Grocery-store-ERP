'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';

interface Product {
  _id: string;
  name: string;
  basePrice: number;
  discount: number;
  discountType: string;
  images: string[];
  isHot: boolean;
  isFlashSale: boolean;
  isFeatured: boolean;
  weight: {
    value: number;
    unit: string;
  };
  stock: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const discountedPrice =
    product.discountType === 'percentage'
      ? product.basePrice * (1 - product.discount / 100)
      : product.basePrice - product.discount;

  const savings =
    product.discountType === 'percentage'
      ? `${product.discount}% OFF`
      : `Rs. ${product.discount} OFF`;

  const handleAddToCart = async () => {
    setIsAdding(true);
    onAddToCart(product._id);
    setIsAdding(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border border-gray-100">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {product.images && product.images[0] ? (
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
            No Image
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {product.isHot && (
            <Badge className="bg-red-500">Hot</Badge>
          )}
          {product.isFlashSale && (
            <Badge className="bg-orange-500">Flash Sale</Badge>
          )}
          {product.discount > 0 && (
            <Badge className="bg-green-600">{savings}</Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-2 transition"
        >
          <Heart
            className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>

        {/* Stock Status */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-800 hover:text-green-700 truncate cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {/* Weight */}
        <p className="text-sm text-gray-500 mb-2">
          {product.weight.value} {product.weight.unit}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">Rs. {discountedPrice.toFixed(0)}</span>
          {product.discount > 0 && (
            <span className="text-sm text-gray-400 line-through">
              Rs. {product.basePrice.toFixed(0)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || isAdding}
          className="w-full bg-green-700 hover:bg-green-800 text-white"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
}
