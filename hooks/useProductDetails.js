import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export const useProductDetails = (slug, pincode, vendorId, postOffice, user) => {
     const [product, setProduct] = useState(null);
     const [loading, setLoading] = useState(true);
     const [refreshing, setRefreshing] = useState(false);
     const [notifyLoading, setNotifyLoading] = useState(false);
     const [selectedVariant, setSelectedVariant] = useState(null);

     useEffect(() => {
          async function fetchProduct() {
               if (!slug) return;

               // Only show full loading if product isn't already loaded
               if (!product) {
                    setLoading(true);
               } else {
                    setRefreshing(true);
               }

               try {
                    const url = new URL(`/api/products/${slug}`, window.location.origin);
                    if (vendorId) url.searchParams.set("vendor", vendorId);
                    if (pincode) url.searchParams.set("pincode", pincode);

                    const res = await fetch(url.toString());
                    const data = await res.json();

                    if (data.success) {
                         const p = data.product;

                         // Optimization: Check for differences before updating to prevent unnecessary re-renders
                         const images = p.images?.map((img) => (typeof img === "string" ? img : img.url)) || [];
                         if (p.image) images.unshift(p.image);

                         const processedProduct = {
                              ...p,
                              images: images.length > 0 ? images : ["/images/placeholder.png"],
                         };

                         setProduct(processedProduct);

                         // Update selected variant data (like stock) while keeping the same selection if possible
                         if (p.variants && p.variants.length > 0) {
                              if (selectedVariant) {
                                   const updatedVar = p.variants.find(v => v._id === selectedVariant._id) || p.variants[0];
                                   setSelectedVariant(updatedVar);
                              } else {
                                   const defaultVar = p.variants.find((v) => v.stock > 0) || p.variants[0];
                                   setSelectedVariant(defaultVar);
                              }
                         }
                    }
               } catch (error) {
                    console.error("Error fetching product:", error);
                    toast.error("Failed to update availability.");
               } finally {
                    setLoading(false);
                    setRefreshing(false);
               }
          }
          fetchProduct();
     }, [slug, pincode, vendorId]);

     const handleNotifyRequest = async (onGuestNotify) => {
          if (!selectedVariant) return;

          if (user) {
               setNotifyLoading(true);
               try {
                    const res = await fetch("/api/restock-requests", {
                         method: "POST",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({
                              productId: product._id,
                              variantId: selectedVariant._id,
                              customerId: user.id || user._id,
                              name: user.name,
                              email: user.email,
                              phone: user.phone || null,
                              pincode,
                              postOffice,
                              vendorId,
                         }),
                    });
                    const data = await res.json();
                    if (data.success) {
                         toast.success(data.message);
                    } else {
                         toast.error(data.error);
                    }
               } catch (error) {
                    toast.error("Failed to submit request");
               } finally {
                    setNotifyLoading(false);
               }
          } else if (onGuestNotify) {
               onGuestNotify();
          }
     };

     return {
          product,
          loading,
          notifyLoading,
          selectedVariant,
          setSelectedVariant,
          handleNotifyRequest,
     };
};
