"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Home/Navbar";
import Image from "next/image";
import Footer from "@/components/Home/Footer";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function CheckoutPage() {
     const { cartItems, fetchCart } = useCart();
     const { user } = useAuth();
     const router = useRouter();

     const [loading, setLoading] = useState(false);
     const [formData, setFormData] = useState({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          zipLevel: "", // Zip Code
          country: "India", // Default
     });

     useEffect(() => {
          if (user) {
               setFormData(prev => ({
                    ...prev,
                    firstName: user.name?.split(" ")[0] || "",
                    lastName: user.name?.split(" ")[1] || "",
                    email: user.email || "",
                    phone: user.phone || ""
               }));
          }
     }, [user]);

     const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
     const shipping = 0; // Free shipping for now logic
     const total = subtotal + shipping;

     const handleChange = (e) => {
          setFormData({ ...formData, [e.target.name]: e.target.value });
     };

     const handleSubmit = async (e) => {
          e.preventDefault();
          setLoading(true);

          try {
               // 1. Validate Cart (Optional: Call /api/checkout/validate)

               // 2. Create Order
               const orderPayload = {
                    items: cartItems.map(item => ({
                         product: item.id || item.productId, // Handle both ID formats just in case
                         variant: item.variantId,
                         quantity: item.quantity,
                         price: item.price
                    })),
                    shippingAddress: {
                         firstName: formData.firstName,
                         lastName: formData.lastName,
                         address: formData.address,
                         city: formData.city,
                         zip: formData.zipLevel,
                         country: formData.country,
                         phone: formData.phone,
                         email: formData.email
                    },
                    paymentMethod: "COD", // Hardcoded for now until payment gateway
                    totalAmount: total
               };

               // Call Order Creation API (Need to verify endpoint in next step if this fails)
               // Assuming /api/orders for customer creation
               const res = await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(orderPayload)
               });

               const data = await res.json();

               if (data.success) {
                    toast.success("Order placed successfully!");
                    // Clear cart (The API might handle this, or we do it manual)
                    // ideally API clears it. If not, we should call Clear Cart.
                    // For now, let's assume success redirects to Success Page.
                    setTimeout(() => {
                         // Force cart refresh or clear
                         fetchCart();
                         router.push(`/account/orders/${data.order._id}`);
                    }, 1500);
               } else {
                    toast.error(data.error || "Failed to place order");
               }

          } catch (error) {
               console.error(error);
               toast.error("Something went wrong");
          } finally {
               setLoading(false);
          }
     };

     if (cartItems.length === 0) {
          return (
               <div className="min-h-screen bg-gray-50 flex flex-col">
                    <Navbar />
                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                         <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
                         <button onClick={() => router.push('/collections')} className="bg-primary text-white px-6 py-2 rounded">Shop Now</button>
                    </div>
                    <Footer />
               </div>
          )
     }

     return (
          <div className="bg-gray-50 min-h-screen font-sans">
               <Navbar />

               <main className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                         {/* Left: Shipping Form */}
                         <div>
                              <h2 className="text-xl font-bold text-font-title mb-6">Contact & Shipping</h2>
                              <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">

                                   <div className="grid grid-cols-2 gap-4">
                                        <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                             <input name="firstName" required className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary" value={formData.firstName} onChange={handleChange} />
                                        </div>
                                        <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                             <input name="lastName" required className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary" value={formData.lastName} onChange={handleChange} />
                                        </div>
                                   </div>

                                   <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input type="email" name="email" required className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary" value={formData.email} onChange={handleChange} />
                                   </div>

                                   <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input type="tel" name="phone" required className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary" value={formData.phone} onChange={handleChange} />
                                   </div>

                                   <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <input name="address" required className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary" value={formData.address} onChange={handleChange} />
                                   </div>

                                   <div className="grid grid-cols-2 gap-4">
                                        <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                             <input name="city" required className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary" value={formData.city} onChange={handleChange} />
                                        </div>
                                        <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                                             <input name="zipLevel" required className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary" value={formData.zipLevel} onChange={handleChange} />
                                        </div>
                                   </div>

                                   <div className="mt-6 pt-6 border-t border-gray-100">
                                        <h3 className="font-bold text-gray-800 mb-4">Payment</h3>
                                        <div className="flex items-center gap-3 p-4 border border-primary bg-primary/5 rounded-lg">
                                             <input type="radio" checked className="text-primary" readOnly />
                                             <span className="font-medium">Cash on Delivery (COD)</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Online payment gateway coming soon.</p>
                                   </div>

                                   <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary text-white font-bold py-4 rounded-lg mt-6 hover:bg-opacity-90 disabled:opacity-50"
                                   >
                                        {loading ? "Processing..." : `Place Order (₹${total.toFixed(2)})`}
                                   </button>

                              </form>
                         </div>

                         {/* Right: Order Summary */}
                         <div>
                              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-24">
                                   <h3 className="font-bold text-font-title mb-4">Order Summary</h3>
                                   <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                        {cartItems.length > 0 ? cartItems.map(item => (
                                             <div key={item.id + item.variantId} className="flex gap-4 items-center">
                                                  <div className="relative w-16 h-16 bg-white border border-gray-200 rounded overflow-hidden shrink-0">
                                                       {item.image && <Image src={item.image} alt={item.name} fill className="object-contain p-1" />}
                                                       <span className="absolute top-0 right-0 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-bl-lg font-bold">{item.quantity}</span>
                                                  </div>
                                                  <div className="flex-1">
                                                       <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                                                       <p className="text-xs text-gray-500">{item.variantName}</p>
                                                  </div>
                                                  <div className="text-sm font-bold">₹{(item.price * item.quantity).toFixed(2)}</div>
                                             </div>
                                        )) : (
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
                         </div>

                    </div>
               </main>

               <Footer />
          </div>
     );
}
