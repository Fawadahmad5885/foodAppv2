"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

const CAROUSEL_IMAGES = [
  "/images/carousel/carousel1.jpg",
  "/images/carousel/carousel2.jpg",
];

const arrowButtonClass =
  "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/40 lg:flex";

export function Hero() {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);

  return (
    <section className="relative w-full overflow-hidden">
      <Swiper
        onSwiper={setSwiper}
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        breakpoints={{
          1024: {
            pagination: { enabled: false },
          },
        }}
        className="hero-swiper w-full"
      >
        {CAROUSEL_IMAGES.map((src, index) => (
          <SwiperSlide key={src}>
            <div className="relative aspect-[21/9] w-full min-h-[200px] sm:min-h-[280px] md:min-h-[360px]">
              <Image
                src={src}
                alt={`Promotional banner ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        type="button"
        onClick={() => swiper?.slidePrev()}
        aria-label="Previous slide"
        className={`left-4 sm:left-6 ${arrowButtonClass}`}
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
      </button>

      <button
        type="button"
        onClick={() => swiper?.slideNext()}
        aria-label="Next slide"
        className={`right-4 sm:right-6 ${arrowButtonClass}`}
      >
        <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
      </button>
    </section>
  );
}
