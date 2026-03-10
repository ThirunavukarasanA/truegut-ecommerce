import React from "react";
import { MdNotificationsActive } from "react-icons/md";
import { FiMinus, FiPlus } from "react-icons/fi";
import PincodeChecker from "@/components/Product/PincodeChecker";
import { toast } from "react-hot-toast";

export default function ProductInfo({
     product,
     selectedVariant,
     setSelectedVariant,
     quantity,
     handleQuantityChange,
     pincode,
     district,
     addToCart,
     router,
     handleNotifyRequest,
     notifyLoading,
     isServiceable,
}) {
     const onAddToCart = () => {
          if (!isServiceable) {
               toast.error(
                    pincode
                         ? "This location is currently not serviceable. Please try another pincode."
                         : "Please enter your pincode to check availability",
                    { icon: "📍" }
               );

               const section = document.getElementById("pincode-section");
               if (section) {
                    section.scrollIntoView({ behavior: "smooth", block: "center" });
                    const input = section.querySelector("input");
                    if (input) {
                         input.focus();
                         input.classList.add("ring-2", "ring-primary", "border-primary");
                         setTimeout(() => {
                              input.classList.remove("ring-2", "ring-primary", "border-primary");
                         }, 2000);
                    }
               }
               return;
          }

          if (!selectedVariant) return;
          addToCart({
               ...product,
               id: product._id,
               variantId: selectedVariant._id,
               variantName: selectedVariant.name,
               price: selectedVariant.price,
               quantity: quantity,
          });
     };

     const onBuyNow = () => {
          if (!isServiceable) {
               onAddToCart(); // Trigger same validation/scroll
               return;
          }
          if (!selectedVariant) return;

          // We call addToCart here to ensure it's in the state,
          // though the hook/context might navigate immediately.
          // In our current implementation, addToCart is async and then navigates.
          addToCart({
               ...product,
               id: product._id,
               variantId: selectedVariant._id,
               variantName: selectedVariant.name,
               price: selectedVariant.price,
               quantity: quantity,
          });
          router.push("/checkout");
     };

     return (
          <div className="flex flex-col">
               <h1 className="text-3xl italic md:text-4xl font-bold text-font-title mb-4">{product.name}</h1>

               {/* Availability */}
               <div className="flex items-center gap-2 mb-6 text-sm">
                    <span className="font-bold text-gray-700">Availability :</span>
                    <span className={`flex items-center gap-1 ${selectedVariant?.stock > 0 ? "text-green-500" : "text-red-500"}`}>
                         <span className={`w-2 h-2 rounded-full ${selectedVariant?.stock > 0 ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                         {selectedVariant?.stock > 0 ? `In Stock (${selectedVariant.stock})` : "Out of Stock"}
                    </span>
               </div>

               {/* Pricing */}
               <div className="flex items-baseline gap-3 mb-8">
                    <span className="text-4xl font-extrabold text-[#1a1a1a] tracking-tight">
                         ₹ {selectedVariant ? selectedVariant.price.toFixed(2) : "N/A"}
                    </span>
                    {selectedVariant?.oldPrice && (
                         <span className="text-lg text-gray-400 line-through font-medium">₹ {selectedVariant.oldPrice.toFixed(2)}</span>
                    )}
               </div>

               {/* Short Description */}
               <div
                    className="text-gray-600 leading-relaxed mb-8 rich-text-content wrap-break-word w-full"
                    dangerouslySetInnerHTML={{ __html: product.description || "" }}
               />

               {/* Variant Selector */}
               {product.variants && product.variants.length > 0 && (
                    <div className="mb-8">
                         <p className="font-bold text-gray-800 mb-2">
                              Size / Variant : <span className="font-normal text-gray-500">{selectedVariant?.name}</span>
                         </p>
                         <div className="flex gap-3 flex-wrap">
                              {product.variants.map((variant) => (
                                   <button
                                        key={variant._id}
                                        onClick={() => setSelectedVariant(variant)}
                                        disabled={!variant.isActive}
                                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${selectedVariant?._id === variant._id
                                                  ? "border-primary text-primary bg-primary/5"
                                                  : "border-gray-200 text-gray-600 hover:border-gray-300"
                                             } ${!variant.isActive ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
                                   >
                                        {variant.name}
                                   </button>
                              ))}
                         </div>
                    </div>
               )}

               {/* Quantity Selector */}
               <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                         <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Qty</span>
                         <div className="flex items-center gap-4">
                              <button
                                   onClick={() => handleQuantityChange("dec")}
                                   className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary transition-all shadow-sm active:scale-90"
                              >
                                   <FiMinus size={18} />
                              </button>
                              <span className="text-lg font-bold text-[#1a1a1a] w-6 text-center tabular-nums">{quantity}</span>
                              <button
                                   onClick={() => handleQuantityChange("inc")}
                                   className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary transition-all shadow-sm active:scale-90"
                              >
                                   <FiPlus size={18} />
                              </button>
                         </div>
                    </div>
               </div>

               <PincodeChecker />

               {/* Action Buttons */}
               <div className="mt-8">
                    {selectedVariant?.stock > 0 ? (
                         <div className="flex gap-4">
                              <button
                                   onClick={onAddToCart}
                                   className={`flex-1 text-white font-bold py-4 rounded-lg uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 bg-[#4a8b3c] hover:bg-[#3d7a30] active:scale-95`}
                              >
                                   Add to Cart
                              </button>
                              <button
                                   onClick={onBuyNow}
                                   className={`flex-1 text-white font-bold py-4 rounded-lg uppercase tracking-wider transition-all shadow-md flex items-center justify-center bg-[#e05d25] hover:bg-[#c94e1b] active:scale-95`}
                              >
                                   Buy it Now
                              </button>
                         </div>
                    ) : (
                         <div className="flex flex-col gap-3">
                              <button
                                   onClick={handleNotifyRequest}
                                   disabled={notifyLoading}
                                   className="w-full bg-amber-500 text-white font-bold py-4 rounded-lg uppercase tracking-wider hover:bg-amber-600 transition-colors shadow-md flex items-center justify-center gap-2"
                              >
                                   <MdNotificationsActive size={20} />
                                   {notifyLoading ? "Processing..." : "STOCK REQUEST"}
                              </button>
                              <p className="text-center text-sm text-gray-500">
                                   We'll notify you via email/phone once stock is available.
                              </p>
                         </div>
                    )}
               </div>
          </div>
     );
}
