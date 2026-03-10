"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Home/Navbar";
import Footer from "@/components/Home/Footer";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useLocation } from "@/context/LocationContext";
import { secureFetch } from "@/utils/secureFetch";
import AuthBridge from "@/components/Checkout/AuthBridge";
import ShippingForm from "@/components/Checkout/ShippingForm";
import PaymentSelector from "@/components/Checkout/PaymentSelector";
import OrderSummary from "@/components/Checkout/OrderSummary";
import EmptyCart from "@/components/Checkout/EmptyCart";
import { useCheckoutSubmission } from "@/hooks/useCheckoutSubmission";

export default function CheckoutPage() {
     const { cartItems, fetchCart, updateItemQuantity } = useCart();
     const { user } = useAuth();
     const { pincode, district, vendorId, updateLocation } = useLocation();
     const router = useRouter();

     const [paymentMethod, setPaymentMethod] = useState('Online');
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

     const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
     const shipping = 0; // Free shipping logic
     const total = subtotal + shipping;

     // Custom hook for checkout submission logic
     const { handleSubmit, loading } = useCheckoutSubmission({
          cartItems,
          fetchCart,
          formData,
          setFormData,
          paymentMethod,
          total
     });

     // Initialize Form from User or TempCustomer
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
          // Note: Guest form restoration from /api/temp-customer removed to ensure clean form on visit
     }, [user]);

     useEffect(() => {
          // Guard: Only update form from context if they are actually different
          // This prevents the context -> form -> context loop
          if ((pincode && pincode !== formData.zipLevel) || (district && district !== formData.city)) {
               setFormData(prev => ({
                    ...prev,
                    city: district || prev.city,
                    zipLevel: pincode || prev.zipLevel
               }));
          }
     }, [pincode, district]);

     useEffect(() => {
          const fetchLocationDetails = async () => {
               // Guard: Only fetch if it's a 6-digit zip AND it's different from what we already have in context
               // This prevents redundant /api/location calls when navigating to checkout
               if (formData.zipLevel.length === 6 && formData.zipLevel !== pincode) {
                    try {
                         const res = await fetch(`/api/location/${formData.zipLevel}`);
                         const data = await res.json();
                         if (data.serviceable) {
                              // Sync with Global Location Context using NEW object signature
                              if (updateLocation) {
                                   updateLocation({
                                        pincode: formData.zipLevel,
                                        postOffice: data.postOffices?.[0] || "",
                                        vendorId: data.vendor?.id || null,
                                        vendorName: data.vendor?.name || "Global Vendor",
                                        isServiceable: true
                                   });
                              }

                              setFormData(prev => ({
                                   ...prev,
                                   city: data.district || prev.city,
                                   state: data.state || prev.state
                              }));
                         } else {
                              toast.error(`Sorry, we don't service ${formData.zipLevel} yet.`);
                         }
                    } catch (e) {
                         console.error("Failed to fetch location details", e);
                    }
               }
          };
          fetchLocationDetails();
     }, [formData.zipLevel, updateLocation, pincode]); // Added pincode to deps for guard


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

     if (cartItems.length === 0) {
          return <EmptyCart />;
     }

     return (
          <div className="bg-gray-50 min-h-screen font-sans">
               <Navbar />

               <main className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                         {/* Left: Shipping Form */}
                         <div>
                              <h2 className="text-xl font-bold text-font-title mb-6">Contact & Shipping</h2>

                              <AuthBridge user={user} />

                              <form onSubmit={handleSubmit}>
                                   <ShippingForm
                                        formData={formData}
                                        handleChange={handleChange}
                                        handleBlur={handleBlur}
                                        pincode={pincode}
                                        district={district}
                                   />

                                   <PaymentSelector
                                        paymentMethod={paymentMethod}
                                        setPaymentMethod={setPaymentMethod}
                                   />

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
                              <OrderSummary
                                   cartItems={cartItems}
                                   updateItemQuantity={updateItemQuantity}
                                   subtotal={subtotal}
                                   total={total}
                                   loading={loading}
                              />
                         </div>

                    </div>
               </main>

               <Footer />
          </div>
     );
}
