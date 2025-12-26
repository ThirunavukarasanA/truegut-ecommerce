"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FiShoppingBag, FiHeart, FiEye } from "react-icons/fi";
import { useCart } from "../../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  return (
    <div className="group">
      {/* Image Container */}
      <div className="relative rounded-sm mb-4 flex items-center justify-center aspect-square transition-all duration-300 group-hover:bg-bg-color">
        <div className="relative w-full h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain mix-blend-multiply"
          />
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 transition-all duration-500 opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0">
          <button
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white shadow-sm transition-colors"
            title="Add to Cart"
            onClick={() => addToCart(product)}
          >
            <FiShoppingBag />
          </button>
          {/* <button
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white shadow-sm transition-colors"
            title="Wishlist"
          >
            <FiHeart />
          </button> */}
          <button
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white shadow-sm transition-colors"
            title="Quick View"
          >
            <FiEye />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="">
        <h3 className="font-bold text-font-title text-lg mb-1 group-hover:text-primary transition-colors cursor-pointer">
          <Link href={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="text-gray-400 text-xs mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center gap-3">
          <span className="font-bold text-font-title">
            ₹{product.price.toFixed(2)}
          </span>
          {product.oldPrice && (
            <span className="text-gray-400 text-sm line-through">
              ₹{product.oldPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
