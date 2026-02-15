"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Home/Navbar";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Home/Footer";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useLocation } from "@/context/LocationContext";
import { FcGoogle } from "react-icons/fc";
import { MdLogin } from "react-icons/md";
import { FiMinus, FiPlus } from "react-icons/fi";
import { secureFetch } from "@/utils/secureFetch";

export default function CheckoutPage() {
     const { cartItems, fetchCart, updateItemQuantity } = useCart();
     const { user } = useAuth();
     const { pincode, district, postOffice, vendorId } = useLocation();
     const router = useRouter();

     const [loading, setLoading] = useState(false);
     const [formData, setFormData] = useState({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zipLevel: "", // Zip Code
          country: "India", // Default
     });

     // Initialize Form from User or TempCustomer
     useEffect(() => {
          const initForm = async () => {
               if (user) {
                    setFormData(prev => ({
                         ...prev,
                         firstName: user.name?.split(" ")[0] || "",
                         lastName: user.name?.split(" ")[1] || "",
                         email: user.email || "",
                         phone: user.phone || ""
                    }));
               } else {
                    // Fetch Temp Customer Data
                    try {
                         const data = await secureFetch("/api/temp-customer");
                         if (data && data.success) {
                              const tempCustomer = data;
                              setFormData(prev => ({
                                   ...prev,
                                   firstName: tempCustomer.firstName || prev.firstName,
                                   lastName: tempCustomer.lastName || prev.lastName,
                                   email: tempCustomer.email || prev.email,
                                   phone: tempCustomer.phone || prev.phone,
                                   address: tempCustomer.address?.street || prev.address,
                                   city: tempCustomer.address?.city || prev.city,
                                   state: tempCustomer.address?.state || prev.state,
                                   zipLevel: tempCustomer.address?.pincode || prev.zipLevel,
                              }));
                         }
                    } catch (e) {
                         console.error("Failed to load temp customer data", e);
                    }
               }
          };
          initForm();
     }, [user]);

     useEffect(() => {
          if (pincode || district) {
               setFormData(prev => ({
                    ...prev,
                    city: district || prev.city,
                    zipLevel: pincode || prev.zipLevel
               }));
          }
     }, [pincode, district]);

     useEffect(() => {
          const fetchLocationDetails = async () => {
               if (formData.zipLevel.length === 6) {
                    try {
                         const res = await fetch(`/api/location/${formData.zipLevel}`);
                         const data = await res.json();
                         if (data.serviceable) {
                              setFormData(prev => ({
                                   ...prev,
                                   city: data.district || prev.city,
                                   state: data.state || prev.state
                              }));
                         }
                    } catch (e) {
                         console.error("Failed to fetch location details", e);
                    }
               }
          };
          fetchLocationDetails();
     }, [formData.zipLevel]);

     const [paymentMethod, setPaymentMethod] = useState('Online');

     const loadRazorpay = () => {
          return new Promise((resolve) => {
               const script = document.createElement('script');
               script.src = 'https://checkout.razorpay.com/v1/checkout.js';
               script.onload = () => {
                    resolve(true);
               };
               script.onerror = () => {
                    resolve(false);
               };
               document.body.appendChild(script);
          });
     };

     const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
     const shipping = 0; // Free shipping for now logic
     const total = subtotal + shipping;

     const handleChange = (e) => {
          const { name, value } = e.target;

          // Number restriction logic for specific fields
          if (name === 'phone' || name === 'zipLevel') {
               const numericValue = value.replace(/\D/g, ''); // Remove non-digits
               setFormData(prev => ({ ...prev, [name]: numericValue }));
          } else {
               setFormData(prev => ({ ...prev, [name]: value }));
          }
     };

     const handleBlur = async () => {
          if (!user) {
               try {
                    // Save partial data to temp-customer
                    const payload = {
                         firstName: formData.firstName,
                         lastName: formData.lastName,
                         email: formData.email,
                         phone: formData.phone,
                         address: {
                              street: formData.address,
                              city: formData.city,
                              pincode: formData.zipLevel,
                              country: formData.country,
                              state: formData.state
                         }
                    };
                    await secureFetch("/api/temp-customer", {
                         method: "POST",
                         body: payload
                    });
               } catch (e) {
                    console.error("Autosave failed", e);
               }
          }
     };

     const handleSubmit = async (e) => {
          e.preventDefault();
          setLoading(true);

          try {
               // 1. Validate Cart
               const validationPayload = {
                    items: cartItems.map(item => ({
                         product: item.id || item.productId,
                         variant: item.variantId,
                         quantity: item.quantity,
                         price: item.price
                    })),
                    location: { pincode: formData.zipLevel }
               };

               const validateData = await secureFetch("/api/checkout/validate", {
                    method: "POST",
                    body: validationPayload
               });

               if (!validateData.success || !validateData.isValid) {
                    if (validateData.errors && validateData.errors.length > 0) {
                         validateData.errors.forEach(err => toast.error(err));
                    }
                    if (validateData.warnings && validateData.warnings.length > 0) {
                         validateData.warnings.forEach(warn => toast(warn, { icon: '⚠️' }));
                         fetchCart();
                    }
                    setLoading(false);
                    return;
               }

               if (validateData.warnings && validateData.warnings.length > 0) {
                    validateData.warnings.forEach(warn => toast(warn, { icon: '⚠️' }));
               }

               // Prepare Order Payload Logic
               const createOrderPayload = (paymentDetails = { method: "COD" }) => ({
                    customer: {
                         name: `${formData.firstName} ${formData.lastName}`.trim(),
                         email: formData.email,
                         phone: formData.phone,
                         address: {
                              street: formData.address,
                              city: formData.city,
                              state: formData.state || "",
                              pincode: formData.zipLevel,
                              country: formData.country
                         }
                    },
                    items: cartItems.map(item => ({
                         product: item.id || item.productId,
                         variant: item.variantId,
                         quantity: item.quantity,
                         price: item.price
                    })),
                    paymentDetails: paymentDetails,
                    totalAmount: total,
               });


               if (paymentMethod === 'Online') {
                    // RAZORPAY FLOW
                    const res = await loadRazorpay();
                    if (!res) {
                         toast.error("Razorpay SDK failed to load. Are you online?");
                         setLoading(false);
                         return;
                    }

                    // Create Order on Backend
                    const orderData = await secureFetch("/api/payment/razorpay", {
                         method: "POST",
                         body: { amount: total }
                    });

                    if (!orderData || !orderData.id) {
                         toast.error("Server error. Could not create order.");
                         setLoading(false);
                         return;
                    }

                    const options = {
                         key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                         amount: orderData.amount,
                         currency: orderData.currency,
                         name: "Fermentaa/TrueGut",
                         description: "Order Payment",
                         image: "/android-chrome-192x192.png", // Or logo path
                         order_id: orderData.id,
                         handler: async function (response) {
                              // Success Handler
                              try {
                                   const paymentDetails = {
                                        method: "Razorpay",
                                        transactionId: response.razorpay_payment_id,
                                        // razorpayOrderId: response.razorpay_order_id,
                                        // razorpaySignature: response.razorpay_signature
                                   };

                                   // Place Order
                                   const finalOrderPayload = createOrderPayload(paymentDetails);
                                   const data = await secureFetch("/api/orders", {
                                        method: "POST",
                                        body: finalOrderPayload
                                   });

                                   if (data.success) {
                                        toast.success("Order placed successfully!");
                                        router.push(`/`);
                                        setFormData({
                                             firstName: "", lastName: "", email: "", phone: "",
                                             address: "", city: "", state: "", zipLevel: "", country: ""
                                        });
                                        fetchCart();
                                   } else {
                                        toast.error(data.error || "Failed to place order after payment. Contact support.");
                                        setLoading(false);
                                   }
                              } catch (err) {
                                   console.error(err);
                                   toast.error("Payment successful but failed to create order.");
                                   setLoading(false);
                              }
                         },
                         prefill: {
                              name: `${formData.firstName} ${formData.lastName}`,
                              email: formData.email,
                              contact: formData.phone,
                         },
                         theme: {
                              color: "#166534", // primary color
                         },
                         modal: {
                              ondismiss: function () {
                                   setLoading(false);
                                   toast("Payment cancelled");
                              }
                         }
                    };

                    const paymentObject = new window.Razorpay(options);
                    paymentObject.open();

               } else {
                    // COD FLOW
                    const orderPayload = createOrderPayload({ method: "COD" });

                    const data = await secureFetch("/api/orders", {
                         method: "POST",
                         body: orderPayload
                    });

                    if (data.success) {
                         toast.success("Order placed successfully!");
                         router.push(`/`);
                         setFormData({
                              firstName: "",
                              lastName: "",
                              email: "",
                              phone: "",
                              address: "",
                              city: "",
                              state: "",
                              zipLevel: "",
                              country: ""
                         });

                         fetchCart();
                    } else {
                         toast.error(data.error || "Failed to place order");
                    }
                    setLoading(false);
               }

          } catch (error) {
               console.error(error);
               toast.error("Something went wrong");
               setLoading(false);
          }
          // Note: Loading state is handled inside blocks or ondismiss for Razorpay
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

                              {!user && (
                                   <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="space-y-1">
                                             <h3 className="font-bold text-gray-800">Already have an account?</h3>
                                             <p className="text-sm text-gray-500">Sign in for a faster checkout experience.</p>
                                        </div>
                                        <div className="flex gap-3 w-full md:w-auto">
                                             <Link
                                                  href="/login?redirect=/checkout"
                                                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors"
                                             >
                                                  <MdLogin size={18} />
                                                  Login
                                             </Link>
                                             <Link
                                                  href="/login?redirect=/checkout"
                                                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors"
                                             >
                                                  <FcGoogle size={18} />
                                                  Google
                                             </Link>
                                        </div>
                                   </div>
                              )}

                              <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">

                                   <div className="grid grid-cols-2 gap-4">
                                        <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                             <input name="firstName" required className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary" value={formData.firstName} onChange={handleChange} onBlur={handleBlur} />
                                        </div>
                                        <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                             <input name="lastName" required className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary" value={formData.lastName} onChange={handleChange} onBlur={handleBlur} />
                                        </div>
                                   </div>

                                   <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input type="email" name="email" required className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary" value={formData.email} onChange={handleChange} onBlur={handleBlur} />
                                   </div>

                                   <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input type="text" inputMode="numeric" name="phone" required maxLength={10} className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary" value={formData.phone} onChange={handleChange} onBlur={handleBlur} />
                                   </div>

                                   <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <input name="address" required className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary" value={formData.address} onChange={handleChange} onBlur={handleBlur} />
                                   </div>

                                   <div className="grid grid-cols-2 gap-4">
                                        <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                             <input name="city" required className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary" value={formData.city} onChange={handleChange} onBlur={handleBlur} />
                                        </div>
                                        <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                             <input name="state" required className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary" value={formData.state} onChange={handleChange} onBlur={handleBlur} />
                                        </div>
                                   </div>

                                   <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                                        <input type="text" inputMode="numeric" name="zipLevel" required disabled maxLength={6} className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary" value={formData.zipLevel} onChange={handleChange} onBlur={handleBlur} />
                                   </div>

                                   <div className="mt-6 pt-6 border-t border-gray-100">
                                        <h3 className="font-bold text-gray-800 mb-4">Payment</h3>

                                        <div
                                             className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all mb-3 ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}
                                             onClick={() => setPaymentMethod('COD')}
                                        >
                                             <input
                                                  type="radio"
                                                  name="paymentMethod"
                                                  value="COD"
                                                  checked={paymentMethod === 'COD'}
                                                  onChange={() => setPaymentMethod('COD')}
                                                  className="text-primary focus:ring-primary"
                                             />
                                             <span className="font-medium">Cash on Delivery (COD)</span>
                                        </div>

                                        <div
                                             className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'Online' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}
                                             onClick={() => setPaymentMethod('Online')}
                                        >
                                             <input
                                                  type="radio"
                                                  name="paymentMethod"
                                                  value="Online"
                                                  checked={paymentMethod === 'Online'}
                                                  onChange={() => setPaymentMethod('Online')}
                                                  className="text-primary focus:ring-primary"
                                             />
                                             <div>
                                                  <span className="font-medium block">Pay via Razorpay</span>
                                                  <span className="text-xs text-gray-500">UPI, Cards, NetBanking</span>
                                             </div>
                                        </div>
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

                                                       <div className="flex items-center gap-2 mt-1">
                                                            <button
                                                                 onClick={() => updateItemQuantity(item.id, item.variantId, item.quantity - 1)}
                                                                 className="text-gray-400 hover:text-primary disabled:opacity-30"
                                                                 disabled={item.quantity <= 1 || loading}
                                                            >
                                                                 <FiMinus size={14} />
                                                            </button>
                                                            <span className="text-xs font-bold text-gray-700 min-w-[16px] text-center">{item.quantity}</span>
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
