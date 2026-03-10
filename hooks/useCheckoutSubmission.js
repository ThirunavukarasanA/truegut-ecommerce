import { useState } from "react";
import { toast } from "react-hot-toast";
import { secureFetch } from "@/utils/secureFetch";
import { useRouter } from "next/navigation";

export const useCheckoutSubmission = ({ cartItems, fetchCart, formData, setFormData, paymentMethod, total }) => {
     const [loading, setLoading] = useState(false);
     const router = useRouter();

     const loadRazorpay = () => {
          return new Promise((resolve) => {
               const script = document.createElement("script");
               script.src = "https://checkout.razorpay.com/v1/checkout.js";
               script.onload = () => resolve(true);
               script.onerror = () => resolve(false);
               document.body.appendChild(script);
          });
     };

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
                    country: formData.country,
               },
          },
          items: cartItems.map((item) => ({
               product: item.id || item.productId,
               variant: item.variantId,
               quantity: item.quantity,
               price: item.price,
          })),
          paymentDetails: paymentDetails,
          totalAmount: total,
     });

     const handleSubmit = async (e) => {
          if (e) e.preventDefault();
          setLoading(true);

          try {
               // 1. Validate Cart
               const validationPayload = {
                    items: cartItems.map((item) => ({
                         product: item.id || item.productId,
                         variant: item.variantId,
                         quantity: item.quantity,
                         price: item.price,
                    })),
                    location: { pincode: formData.zipLevel },
               };

               const validateData = await secureFetch("/api/checkout/validate", {
                    method: "POST",
                    body: validationPayload,
               });

               if (!validateData.success || !validateData.isValid) {
                    if (validateData.errors && validateData.errors.length > 0) {
                         validateData.errors.forEach((err) => toast.error(err));
                    }
                    if (validateData.warnings && validateData.warnings.length > 0) {
                         validateData.warnings.forEach((warn) => toast(warn, { icon: "⚠️" }));
                         fetchCart();
                    }
                    setLoading(false);
                    return;
               }

               if (validateData.warnings && validateData.warnings.length > 0) {
                    validateData.warnings.forEach((warn) => toast(warn, { icon: "⚠️" }));
               }

               if (paymentMethod === "Online") {
                    // RAZORPAY FLOW
                    const sdkLoaded = await loadRazorpay();
                    if (!sdkLoaded) {
                         toast.error("Razorpay SDK failed to load. Are you online?");
                         setLoading(false);
                         return;
                    }

                    const orderData = await secureFetch("/api/payment/razorpay", {
                         method: "POST",
                         body: { amount: total },
                    });

                    if (!orderData || !orderData.id) {
                         toast.error("Server error. Could not create payment order.");
                         setLoading(false);
                         return;
                    }

                    const options = {
                         key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                         amount: orderData.amount,
                         currency: orderData.currency,
                         name: "Fermentaa/TrueGut",
                         description: "Order Payment",
                         image: "/android-chrome-192x192.png",
                         order_id: orderData.id,
                         handler: async function (response) {
                              try {
                                   const finalOrderPayload = createOrderPayload({
                                        method: "Razorpay",
                                        transactionId: response.razorpay_payment_id,
                                   });

                                   const data = await secureFetch("/api/orders", {
                                        method: "POST",
                                        body: finalOrderPayload,
                                   });

                                   if (data.success) {
                                        toast.success("Order placed successfully!");
                                        setFormData({
                                             firstName: "",
                                             lastName: "",
                                             email: "",
                                             phone: "",
                                             address: "",
                                             city: "",
                                             state: "",
                                             zipLevel: "",
                                             country: "",
                                        });
                                        fetchCart();
                                        router.push("/");
                                   } else {
                                        toast.error(data.error || "Failed to place order after payment.");
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
                         theme: { color: "#166534" },
                         modal: {
                              ondismiss: function () {
                                   setLoading(false);
                                   toast("Payment cancelled");
                              },
                         },
                    };

                    const paymentObject = new window.Razorpay(options);
                    paymentObject.open();
               } else {
                    // COD FLOW
                    const orderPayload = createOrderPayload({ method: "COD" });
                    const data = await secureFetch("/api/orders", {
                         method: "POST",
                         body: orderPayload,
                    });

                    if (data.success) {
                         toast.success("Order placed successfully!");
                         setFormData({
                              firstName: "",
                              lastName: "",
                              email: "",
                              phone: "",
                              address: "",
                              city: "",
                              state: "",
                              zipLevel: "",
                              country: "",
                         });
                         fetchCart();
                         router.push("/");
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
     };

     return { handleSubmit, loading };
};
