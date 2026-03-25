import React from "react";
import Image from "next/image";
import { FiMinus, FiPlus } from "react-icons/fi";

export default function OrderSummary({ cartItems, updateItemQuantity, subtotal, total, loading }) {
     return (
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-24">
               <h3 className="font-bold text-font-title mb-4">Order Summary</h3>
               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {cartItems.length > 0 ? (
                         cartItems.map((item) => (
                              <div key={item.id + item.variantId} className="flex gap-4 items-center">
                                   <div className="relative w-16 h-16 bg-white border border-gray-200 rounded overflow-hidden shrink-0">
                                        {item.image && (
                                             <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                                        )}
                                        <span className="absolute top-0 right-0 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-bl-lg font-bold">
                                             {item.quantity}
                                        </span>
                                   </div>
                                   <div className="flex-1">
                                        <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.variantName}</p>

                                        <div className="flex items-center gap-2 mt-1">
                                             <button
                                                  onClick={() => updateItemQuantity(item.id, item.variantId, item.quantity - 1)}
                                                  className="text-gray-400 hover:text-primary disabled:opacity-30"
                                                  disabled={loading}
                                             >
                                                  <FiMinus size={14} />
                                             </button>
                                             <span className="text-xs font-bold text-gray-700 min-w-[16px] text-center">
                                                  {item.quantity}
                                             </span>
                                             <button
                                                  onClick={() => updateItemQuantity(item.id, item.variantId, item.quantity + 1)}
                                                  className="text-gray-400 hover:text-primary disabled:opacity-30"
                                                  disabled={loading}
                                             >
                                                  <FiPlus size={14} />
                                             </button>
                                        </div>
                                   </div>
                                   <div className="text-sm font-bold">₹{(item.price * item.quantity).toFixed(2)}</div>
                              </div>
                         ))
                    ) : (
                         <p className="text-center text-gray-500">No items in cart</p>
                    )}
               </div>

               <div className="border-t border-gray-200 mt-6 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                         <span className="text-gray-600">Subtotal</span>
                         <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                         <span className="text-gray-600">Shipping</span>
                         <span className="font-medium">Free</span>
                    </div>
               </div>

               <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center text-xl font-bold text-font-title">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
               </div>
          </div>
     );
}
