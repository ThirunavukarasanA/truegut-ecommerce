"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FiShoppingBag, FiHeart, FiEye } from "react-icons/fi";
import { useCart } from "../../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  return (
    <div className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col relative">
      {/* Supplier Tag */}
      <div className="absolute top-6 left-6 z-10">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
          SUPPLIER ALPHA (ZONE 1)
        </span>
      </div>

      {/* Image Container */}
      <div className="relative rounded-2xl overflow-hidden mb-6 aspect-4/3 w-full bg-gray-50">
        <Link href={`/collections/${product.slug}`} className="block w-full h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <h3 className="font-bold italic text-primary text-xl mb-2 uppercase tracking-tight">
          <Link href={`/collections/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* Price and Action Row */}
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-font-title text-2xl">
              ₹{product.price}
            </span>
            <Link href="#" className="text-[10px] font-bold text-green-600 underline uppercase tracking-wider hover:text-primary transition-colors">
              VIEW LAB CERTIFICATE
            </Link>
          </div>

          <button
            onClick={() => addToCart(product)}
            className="bg-secondary text-white text-xs font-bold py-3 px-6 rounded-lg uppercase tracking-wider hover:bg-primary transition-colors"
          >
            ADD TO BAG
          </button>
        </div>
      </div>
    </div>
  );
}
