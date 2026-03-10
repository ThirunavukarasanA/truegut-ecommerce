import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ProductGallery({ images, productName }) {
     const [activeImage, setActiveImage] = useState(images?.[0] || "");
     const [swiper, setSwiper] = useState(null);

     useEffect(() => {
          if (images?.[0]) setActiveImage(images[0]);
     }, [images]);

     useEffect(() => {
          if (swiper && images) {
               const index = images.findIndex((img) => img === activeImage);
               if (index !== -1) {
                    swiper.slideTo(index);
               }
          }
     }, [activeImage, swiper, images]);

     if (!images || images.length === 0) return null;

     return (
          <div className="space-y-4">
               {/* Main Image Slider */}
               <div className="relative aspect-square w-full rounded-3xl overflow-hidden group">
                    <Swiper
                         modules={[Navigation, Pagination]}
                         navigation={{
                              nextEl: ".swiper-button-next",
                              prevEl: ".swiper-button-prev",
                         }}
                         onSwiper={setSwiper}
                         onSlideChange={(swiper) => setActiveImage(images[swiper.activeIndex])}
                         spaceBetween={30}
                         className="h-full w-full"
                    >
                         {images.map((img, idx) => (
                              <SwiperSlide key={idx} className="flex items-center justify-center">
                                   <div className="relative w-full h-full">
                                        <Image
                                             src={img}
                                             alt={`${productName} - View ${idx + 1}`}
                                             fill
                                             className="object-contain rounded-3xl group-hover:scale-105 transition-transform duration-700 ease-out"
                                             priority={idx === 0}
                                        />
                                   </div>
                              </SwiperSlide>
                         ))}
                    </Swiper>
               </div>

               {/* Thumbnail Strip */}
               {images.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                         {images.map((img, idx) => (
                              <button
                                   key={idx}
                                   onClick={() => setActiveImage(img)}
                                   className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 transition-all duration-300 transform active:scale-90 ${activeImage === img
                                             ? "border-2 border-primary ring-2 ring-primary/20 shadow-lg"
                                             : "border border-gray-100 hover:border-primary/50 hover:shadow-md grayscale hover:grayscale-0"
                                        }`}
                              >
                                   <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                              </button>
                         ))}
                    </div>
               )}
          </div>
     );
}
