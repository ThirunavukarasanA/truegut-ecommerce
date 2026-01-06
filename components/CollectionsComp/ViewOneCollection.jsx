"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
// Imports cleaned up
import Navbar from "@/components/Home/Navbar";
import MobileBottomNav from "@/components/Home/MobileBottomNav";
import Footer from "@/components/Home/Footer";
import { useCart } from "@/context/CartContext";
import { useParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useAuth } from "@/context/AuthContext";
import RestockModal from "@/components/Product/RestockModal";
import { toast } from "react-hot-toast"; // Changed to react-hot-toast as sonner is not in package.json
import { MdNotificationsActive } from "react-icons/md";

export default function ViewOneCollection() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  /* State */
  const [selectedVariant, setSelectedVariant] = useState(null);
  const { user } = useAuth();
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);

  const handleNotifyRequest = async () => {
    if (!selectedVariant) return;

    // Case 1: Logged In -> Auto Submit
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
            phone: user.phone || null
          })
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
    } else {
      // Case 2: Guest -> Open Modal
      setIsRestockModalOpen(true);
    }
  };

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();

        if (data.success) {
          const p = data.product;
          // Normalize Images
          const images = p.images?.map((img) => (typeof img === "string" ? img : img.url)) || [];
          if (p.image) images.unshift(p.image);

          setProduct({
            ...p,
            images: images.length > 0 ? images : ["/images/placeholder.png"],
          });

          if (images.length > 0) setActiveImage(images[0]);

          // Set default variant
          if (p.variants && p.variants.length > 0) {
            const defaultVar = p.variants.find((v) => v.stock > 0) || p.variants[0];
            setSelectedVariant(defaultVar);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    }
    fetchProduct();
  }, [slug]);

  const [swiper, setSwiper] = useState(null);

  useEffect(() => {
    if (swiper && product && product.images) {
      const index = product.images.findIndex((img) => img === activeImage);
      if (index !== -1) {
        swiper.slideTo(index);
      }
    }
  }, [activeImage, swiper, product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-bold text-gray-400 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  const handleQuantityChange = (type) => {
    if (type === "dec") {
      setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    } else {
      setQuantity((prev) => prev + 1);
    }
  };
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-30 w-full">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            href="/collections"
            className="hover:text-primary transition-colors"
          >
            Collections
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            {/* Main Image Slider */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden group">
              {product.images && product.images.length > 0 ? (
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation={{
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                  }}
                  //   pagination={{ clickable: true }}
                  onSwiper={setSwiper}
                  onSlideChange={(swiper) =>
                    setActiveImage(product.images[swiper.activeIndex])
                  }
                  spaceBetween={30}
                  className="h-full w-full"
                >
                  {product.images.map((img, idx) => (
                    <SwiperSlide
                      key={idx}
                      className="flex items-center justify-center"
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={img}
                          alt={`${product.name} - View ${idx + 1}`}
                          fill
                          className="object-contain rounded-3xl"
                          priority={idx === 0}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  className="object-contain p-6"
                  priority
                />
              )}
            </div>
            {/* Thumbnail Strip */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 transition-all ${activeImage === img
                      ? "border-primary"
                      : "border-transparent hover:border-gray-200"
                      }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl italic md:text-4xl font-bold text-font-title mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-6 text-sm">
              <span className="font-bold text-gray-700">Availability :</span>
              <span className={`flex items-center gap-1 ${selectedVariant?.stock > 0 ? "text-green-500" : "text-red-500"}`}>
                <span className={`w-2 h-2 rounded-full ${selectedVariant?.stock > 0 ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                {selectedVariant?.stock > 0 ? `In Stock (${selectedVariant.stock})` : "Out of Stock"}
              </span>
            </div>

            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-bold text-font-title">
                ₹ {selectedVariant ? selectedVariant.price.toFixed(2) : "N/A"}
              </span>
              {/* Old price logic could be added if variants have msrp/oldPrice */}
            </div>

            <p className="text-gray-600 leading-relaxed mb-8">
              {product.detailedDescription || product.description}
            </p>

            {/* Dynamic Variant Selector */}
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
                      disabled={!variant.isActive} // or stock === 0 if you want to disable out of stock
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors
                            ${selectedVariant?._id === variant._id
                          ? "border-primary text-primary bg-primary/5"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }
                            ${(!variant.isActive) ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}
                        `}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="flex flex-col sm:flex-row gap-6 mb-8">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-800">Quantity :</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange("dec")}
                    className="px-3 py-2 text-gray-600 hover:text-primary transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 font-medium text-gray-800 w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange("inc")}
                    className="px-3 py-2 text-gray-600 hover:text-primary transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions: Add to Cart OR Notify Me */}
            {selectedVariant?.stock > 0 ? (
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (!selectedVariant) return;
                    addToCart({
                      ...product,
                      id: product._id,
                      variantId: selectedVariant._id,
                      variantName: selectedVariant.name,
                      price: selectedVariant.price,
                      quantity: quantity,
                    });
                  }}
                  className="flex-1 bg-[#4a8b3c] text-white font-bold py-4 rounded-lg uppercase tracking-wider hover:bg-[#3d7a30] transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2"
                >
                  Add to Cart
                </button>
                <button className="flex-1 bg-[#e05d25] text-white font-bold py-4 rounded-lg uppercase tracking-wider hover:bg-[#c94e1b] transition-transform active:scale-95 shadow-md">
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
                  {notifyLoading ? "Processing..." : "Notify Me When Available"}
                </button>
                <p className="text-center text-sm text-gray-500">
                  We'll email you when this size is back in stock.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Tabs */}
        {/* Bottom: Tabs */}
        <div className="border-t border-gray-200 pt-12">
          {/* Tab Headers */}
          <div className="flex justify-center mb-12 overflow-x-auto">
            <div className="flex items-center gap-8 min-w-max px-4">
              {["Description", "Nutrition", "History"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`pb-4 text-lg font-bold uppercase tracking-wide transition-colors relative ${activeTab === tab.toLowerCase()
                    ? "text-gray-800"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  {tab}
                  {activeTab === tab.toLowerCase() && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto min-h-[200px]">
            {activeTab === "description" && (
              <div className="animate-fadeIn">
                <h4 className="text-lg font-bold text-gray-800 mb-6">
                  Description
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {product.detailedDescription || product.description}
                </p>
                {product.specs && product.specs.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">
                      Key Specification
                    </h4>
                    <ul className="list-disc list-outside pl-5 space-y-2 text-gray-600 marker:text-gray-400">
                      {product.specs.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "nutrition" && (
              <div className="animate-fadeIn">
                <h4 className="text-lg font-bold text-gray-800 mb-6">
                  Nutrition Information
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {product.nutrition ||
                    "Our products are crafted with care, respecting traditional fermentation methods that have been passed down through generations. We believe in the power of time and natural ingredients to create foods that strictly adhere to organic standards, ensuring you get the best nature has to offer."}
                </p>

              </div>
            )}

            {activeTab === "history" && (
              <div className="animate-fadeIn">
                <h4 className="text-lg font-bold text-gray-800 mb-6">
                  Product History
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {product.history ||
                    "Our products are crafted with care, respecting traditional fermentation methods that have been passed down through generations. We believe in the power of time and natural ingredients to create foods that strictly adhere to organic standards, ensuring you get the best nature has to offer."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Restock Modal for Guests */}
      {selectedVariant && (
        <RestockModal
          isOpen={isRestockModalOpen}
          onClose={() => setIsRestockModalOpen(false)}
          product={product}
          variant={selectedVariant}
          onSubmitSuccess={() => setIsRestockModalOpen(false)}
        />
      )}
    </div>
  );
}
