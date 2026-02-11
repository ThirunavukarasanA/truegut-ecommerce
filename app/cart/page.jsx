"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Home/Navbar";
import Footer from "@/components/Home/Footer";
import MobileBottomNav from "@/components/Home/MobileBottomNav";

export default function CartPage() {
     const { cartItems, removeFromCart, addToCart, updateItemQuantity, loading } = useCart();
     const [activeItems, setActiveItems] = useState([]);

     useEffect(() => {
          setActiveItems(cartItems);
     }, [cartItems]);

     // Calculate Subtotal
     const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

     return (
          <div className="bg-white min-h-screen flex flex-col font-sans">
               <Navbar />

               <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
                    <h1 className="text-3xl font-bold text-font-title mb-8 text-center md:text-left">
                         Your Cart
                    </h1>

                    {cartItems.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-20 text-center">
                              <p className="text-xl text-gray-500 mb-6">Your cart is currently empty.</p>
                              <Link
                                   href="/collections"
                                   className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-opacity-90 transition-all"
                              >
                                   Continue Shopping
                              </Link>
                         </div>
                    ) : (
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                              {/* Cart Items List */}
                              <div className="lg:col-span-2 space-y-6">
                                   {/* Desktop Header */}
                                   <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-sm font-bold text-gray-500 uppercase tracking-wide">
                                        <div className="col-span-6">Product</div>
                                        <div className="col-span-2 text-center">Price</div>
                                        <div className="col-span-2 text-center">Quantity</div>
                                        <div className="col-span-2 text-right">Total</div>
                                   </div>

                                   {cartItems.length > 0 ? cartItems.map((item) => (
                                        <div key={`${item.id}-${item.variantId}`} className="group relative">
                                             {/* Desktop Row */}
                                             <div className="hidden md:grid grid-cols-12 gap-4 items-center py-6 border-b border-gray-100">
                                                  <div className="col-span-6 flex items-center gap-6">
                                                       <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                                                            {item.image && (
                                                                 <Image
                                                                      src={item.image}
                                                                      alt={item.name}
                                                                      fill
                                                                      sizes="100px"
                                                                      className="object-contain p-2 mix-blend-multiply"
                                                                 />
                                                            )}
                                                       </div>
                                                       <div>
                                                            <Link href={`/collections/${item.slug}`} className="font-bold text-lg text-font-title hover:text-primary transition-colors line-clamp-2">
                                                                 {item.name}
                                                            </Link>
                                                            {item.variantName && (
                                                                 <p className="text-sm text-gray-400 mt-1">Variant: {item.variantName}</p>
                                                            )}
                                                            <button
                                                                 onClick={() => removeFromCart(item.id, item.variantId)}
                                                                 className="flex items-center gap-1 text-sm text-red-400 hover:text-red-600 mt-2 transition-colors"
                                                            >
                                                                 <FiTrash2 /> Remove
                                                            </button>
                                                       </div>
                                                  </div>

                                                  <div className="col-span-2 text-center text-font-title font-medium">
                                                       ₹{item.price.toFixed(2)}
                                                  </div>

                                                  <div className="col-span-2 flex justify-center">
                                                       {/* Quantity Controls */}
                                                       <div className="flex items-center border border-gray-200 rounded-lg">
                                                            <button
                                                                 onClick={() => updateItemQuantity(item.id, item.variantId, item.quantity - 1)}
                                                                 className="px-3 py-2 text-gray-600 hover:text-primary transition-colors disabled:opacity-50"
                                                                 disabled={loading || item.quantity <= 1}
                                                            >
                                                                 <FiMinus size={14} />
                                                            </button>
                                                            <span className="px-3 py-2 font-medium text-gray-800 w-8 text-center">{item.quantity}</span>
                                                            <button
                                                                 onClick={() => updateItemQuantity(item.id, item.variantId, item.quantity + 1)}
                                                                 className="px-3 py-2 text-gray-600 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                 disabled={loading || (item.stock && item.quantity >= item.stock)}
                                                            >
                                                                 <FiPlus size={14} />
                                                            </button>
                                                       </div>
                                                  </div>
                                                  <div className="col-span-2 text-right font-bold text-font-title text-lg">
                                                       ₹{(item.price * item.quantity).toFixed(2)}
                                                  </div>
                                             </div>

                                             {/* Mobile Card */}
                                             <div className="md:hidden flex gap-4 py-4 border-b border-gray-100">
                                                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                                                       {item.image && (
                                                            <Image
                                                                 src={item.image}
                                                                 alt={item.name}
                                                                 fill
                                                                 sizes="80px"
                                                                 className="object-contain p-2 mix-blend-multiply"
                                                            />
                                                       )}
                                                  </div>
                                                  <div className="flex-1">
                                                       <div className="flex justify-between items-start mb-2">
                                                            <Link href={`/collections/${item.slug}`} className="font-bold text-font-title line-clamp-2 pr-4">
                                                                 {item.name}
                                                            </Link>
                                                            <button
                                                                 onClick={() => removeFromCart(item.id, item.variantId)}
                                                                 className="text-gray-400 hover:text-red-500"
                                                            >
                                                                 <FiTrash2 size={18} />
                                                            </button>
                                                       </div>

                                                       {item.variantName && (
                                                            <p className="text-xs text-gray-400 mb-2">{item.variantName}</p>
                                                       )}

                                                       <div className="flex items-center justify-between mt-3">
                                                            <div className="text-sm font-medium text-gray-500">Qty: {item.quantity}</div>
                                                            <div className="font-bold text-font-title">₹{(item.price * item.quantity).toFixed(2)}</div>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   )) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                             <p className="text-xl text-gray-500 mb-6">Your cart is currently empty.</p>
                                             <Link
                                                  href="/collections"
                                                  className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-opacity-90 transition-all"
                                             >
                                                  Continue Shopping
                                             </Link>
                                        </div>
                                   )}

                                   <div className="pt-6">
                                        <Link href="/collections" className="inline-flex items-center text-primary font-medium hover:underline gap-2">
                                             <FiArrowLeft /> Continue Shopping
                                        </Link>
                                   </div>
                              </div>

                              {/* Order Summary */}
                              <div className="lg:col-span-1">
                                   <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 sticky top-24">
                                        <h2 className="text-xl font-bold text-font-title mb-6">Order Summary</h2>

                                        <div className="space-y-4 mb-6">
                                             <div className="flex justify-between text-gray-600">
                                                  <span>Subtotal</span>
                                                  <span className="font-medium text-font-title">₹{subtotal.toFixed(2)}</span>
                                             </div>
                                             <div className="flex justify-between text-gray-600">
                                                  <span>Shipping</span>
                                                  <span className="text-sm text-gray-400">Calculated at checkout</span>
                                             </div>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4 mb-8">
                                             <div className="flex justify-between items-end">
                                                  <span className="font-bold text-lg text-font-title">Total</span>
                                                  <span className="font-bold text-2xl text-primary">₹{subtotal.toFixed(2)}</span>
                                             </div>
                                             <p className="text-xs text-gray-400 mt-2 text-right">Including taxes</p>
                                        </div>

                                        <Link
                                             href="/checkout"
                                             className="block w-full bg-primary text-white text-center font-bold py-4 rounded-xl hover:bg-opacity-90 transition-transform active:scale-95 shadow-lg shadow-primary/20"
                                        >
                                             PROCEED TO CHECKOUT
                                        </Link>

                                        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 grayscale opacity-70">
                                             {/* Payment Icons Placeholder */}
                                             <span className="text-xs">Secure Checkout</span>
                                        </div>
                                   </div>
                              </div>

                         </div>
                    )}
               </main>

               <Footer />
               <MobileBottomNav />
          </div>
     );
}
