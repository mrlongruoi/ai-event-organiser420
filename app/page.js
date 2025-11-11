import React from "react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="pt-20 md:pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left content */}
          <div className="text-center sm:text-left">
            <div className="mb-6">
              <span className="text-gray-500 font-light tracking-wide">
                eventhub<span className="text-purple-400">*</span>
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[0.95] tracking-tight">
              Discover &<br />
              create amazing
              <br />
              <span className="bg-linear-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
                events.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-lg font-light">
              Whether you&apos;re hosting or attending, EventHub makes every
              event memorable. Join our community today.
            </p>

            <button className="bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium hover:bg-gray-100 transition-all">
              Get Started
            </button>
          </div>

          {/* Right - 3D Phone Mockup */}
          <div className="relative block">
            <Image
              src="/3d-react.png"
              alt="react meetup"
              width={700}
              height={700}
              className="w-full h-auto"
              priority
            />
            {/* <video
              width="100%"
              height="100%"
              loop
              playsInline
              autoPlay
              muted
              className="w-full h-auto"
            >
              <source
                src="https://cdn.lu.ma/landing/phone-dark.mp4"
                type="video/mp4;codecs=hvc1"
              />
              <source
                src="https://cdn.lu.ma/landing/phone-dark.webm"
                type="video/webm"
              />
            </video> */}
          </div>
        </div>
      </section>
    </div>
  );
}
