"use client"

import { useState, useRef, useEffect } from "react"
import { FaDumbbell, FaRunning, FaWeightHanging } from "react-icons/fa"

// Change this link to update the video for all equipment
const videoLink = "blob:https://vimeo.com/e4e87dd6-f966-4d5a-9484-70cc007edb18"

const featuredEquipment = [
  {
    title: "Elliptical Trainer",
    description:
      "A great machine for a challenging cardio workout. This machine offers dual handles for variations and a built-in operating console with various features to make your cardio sessions much more intense and effective.",
    video: videoLink,
  },
  {
    title: "Air Rower",
    description:
      "A compact yet powerful machine designed to help you build core strength, muscular endurance, and overall fitness. Elevate your workout experience with this versatile equipment.",
    video: videoLink,
  },
  {
    title: "Assisted Dip Chin",
    description:
      "An ideal machine that helps in overall upper body development as it targets the back, shoulder, and arm muscles effectively. Its foldable kneepad gives the option for unassisted training, and multi-position handles allow exercise variation ensuring a safe and effective workout. Additionally the Assisted pad can be locked and lowered down to perform intense unassisted variations.",
    video: videoLink,
  },
  {
    title: "Vertical Chest Press",
    description:
      "An aesthetically designed machine to target the largest muscle in the chest. It is one of the best machines for building upper body strength with ease and optimum safety.",
    video: videoLink,
  },
  {
    title: "Preacher Curl Bench",
    description:
      "A compact piece of equipment with an adjustable seat and a flat arm pad for a bio-mechanically correct position to strengthen the bicep muscles with ease and optimum safety.",
    video: videoLink,
  },

  {
    title: "Power Squat",
    description:
      "An exceptional machine designed for a complete lower body workout impacting the quads, hamstrings, and glutes. This machine offers an oversized footrest and angled shoulder pads for multiple squats variations, ensuring a safe workout.",
    video: videoLink,
  },
  {
    title: "Lat Pull Down - Dual Pulley",
    description:
      "An aesthetically designed machine to strengthen the back muscles. This machine offers a dual pulley that can be used with strap handles for isolateral training where each side of the body can work independently, ensuring a safe and effective workout.",
    video: videoLink,
  },
]

const categories = [
  {
    icon: <FaRunning className="inline mr-2 text-green-500" />,
    title: "Cardio",
    description:
      "Raceline Treadmills by Jerai Fitness can withstand heavy workloads and requires minimum maintenance. It has a 7 inch LCD backlit display on which all your workout data is displayed.",
  },
  {
    icon: <FaDumbbell className="inline mr-2 text-green-500" />,
    title: "Pin Loaded",
    description:
      "Assisted Dip Chin is a great machine for both beginners and experienced users. The machine can be used with or without the added support pad and includes multiple grips for pull ups and an adjustable bar for performing dips.",
  },
  {
    icon: <FaWeightHanging className="inline mr-2 text-green-500" />,
    title: "Plate Loaded",
    description:
      "Leg Press with a 45 degree angle for accurate training. Carriage travels on linear bearing for friction free & smooth performance. Big non-skid high quality rubber foot platform. Ergonomic adjustable seat protects lower back. Inbuilt plate holder allows easy loading & unloading of weight plates.",
  },
]

// Carousel component for section images with faded sides, thumbnails, and auto-sliding
function SectionCarousel({ images, heading }) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef(null)

  const prev = () => setCurrent((current - 1 + images.length) % images.length)
  const next = () => setCurrent((current + 1) % images.length)

  // Auto-slide logic
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrent((c) => (c + 1) % images.length)
      }, 4000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isPaused, images.length])

  // Pause on hover or interaction
  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  // For left/right images
  const prevIdx = (current - 1 + images.length) % images.length
  const nextIdx = (current + 1) % images.length

  return (
    <div className="w-full flex flex-col items-center mb-32 px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-green-500 mb-4 tracking-tight">{heading}</h2>
        <div className="w-24 h-1 bg-green-500 mx-auto rounded-full"></div>
      </div>
      <div
        className="flex flex-col items-center w-full max-w-7xl mx-auto"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseEnter}
        onTouchEnd={handleMouseLeave}
      >
        {/* Carousel row: left, main, right images (desktop); only main on mobile */}
        <div className="flex flex-row items-center justify-center w-full gap-4 lg:gap-8 mb-8">
          {/* Left faded image (desktop only) */}
          <div className="hidden lg:flex flex-1 justify-end">
            <div className="relative group">
              <img
                src={images[prevIdx].src || "/placeholder.svg"}
                alt=""
                className="object-cover h-48 xl:h-64 w-72 xl:w-80 opacity-40 rounded-2xl shadow-2xl transition-all duration-300 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black/40 rounded-2xl"></div>
            </div>
          </div>
          {/* Main image */}
          <div className="flex-1 flex justify-center relative">
            <div className="relative group">
              <img
                src={images[current].src || "/placeholder.svg"}
                alt={images[current].alt}
                className="object-cover h-64 md:h-80 xl:h-96 w-full max-w-md xl:max-w-lg rounded-2xl shadow-2xl transition-all duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-2xl"></div>
              {/* Navigation arrows */}
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-green-500/80 text-white rounded-full p-3 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-green-500/80 text-white rounded-full p-3 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          {/* Right faded image (desktop only) */}
          <div className="hidden lg:flex flex-1 justify-start">
            <div className="relative group">
              <img
                src={images[nextIdx].src || "/placeholder.svg"}
                alt=""
                className="object-cover h-48 xl:h-64 w-72 xl:w-80 opacity-40 rounded-2xl shadow-2xl transition-all duration-300 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/20 to-black/40 rounded-2xl"></div>
            </div>
          </div>
        </div>
        {/* Thumbnails */}
        <div className="flex gap-3 mb-8 flex-wrap justify-center">
          {images.map((img, idx) => (
            <button
              key={img.src}
              onClick={() => setCurrent(idx)}
              className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                current === idx
                  ? "ring-4 ring-green-500 scale-110 shadow-lg"
                  : "ring-2 ring-gray-600 hover:ring-gray-400 hover:scale-105"
              }`}
            >
              <img
                src={img.src || "/placeholder.svg"}
                alt=""
                className="w-20 h-16 md:w-24 md:h-18 object-cover transition-all duration-300"
              />
              {current !== idx && <div className="absolute inset-0 bg-black/40"></div>}
            </button>
          ))}
        </div>
        {/* Caption */}
        <div className="text-center max-w-4xl">
          <p className="text-gray-300 text-lg md:text-xl lg:text-2xl leading-relaxed font-light mt-8">
            {images[current].caption}
          </p>
        </div>
      </div>
    </div>
  )
}

// Cardio images and captions
const cardioImages = [
  {
    src: "https://img1.wsimg.com/isteam/ip/52c19eb6-1292-49f5-b816-98c777700873/Raceline-584c99a.jpg",
    alt: "Raceline Treadmill",
    caption:
      "Raceline Treadmills by Jerai Fitness can withstand heavy workloads and requires minimum maintenance. It has a 7 inch LCD backlit display on which all your workout data is displayed.",
  },
  {
    src: "https://img1.wsimg.com/isteam/ip/52c19eb6-1292-49f5-b816-98c777700873/Elliptical-c242a18.jpg",
    alt: "Elliptical Trainer",
    caption:
      "Elliptical Trainer from Jerai Fitness, a great machine for a challenging cardio workout. This machine offers dual handles for variations and a built-in operating console with various features to make your cardio sessions much more intense and effective.",
  },
  {
    src: "https://img1.wsimg.com/isteam/ip/52c19eb6-1292-49f5-b816-98c777700873/Spinning%20Bike.jpg",
    alt: "Spinning Bike",
    caption:
      "Intense cardiovascular workout with adjustable resistance levels. Features include a heavy-duty flywheel, fully adjustable seat and handlebars, and emergency stop system for safe, effective indoor cycling.",
  },
  {
    src: "https://img1.wsimg.com/isteam/ip/52c19eb6-1292-49f5-b816-98c777700873/Air%20Rower-791dffd.jpg",
    alt: "Air Rower",
    caption:
      "Air Rower is a compact yet powerful machine designed to help you build core strength, muscular endurance, and overall fitness. Elevate your workout experience with this versatile equipment.",
  },
]

// Pin Loaded images and captions (remove any with broken/missing URLs)
const pinLoadedImages = [
  {
    src: "https://img1.wsimg.com/isteam/ip/52c19eb6-1292-49f5-b816-98c777700873/Assisted%20Dip%20Chin.jpg",
    alt: "Assisted Dip Chin",
    caption:
      "Assisted Dip Chin is a great machine for both beginners and experienced users. The machine can be used with or without the added support pad and includes multiple grips for pull ups and an adjustable bar for performing dips."
  },
  {
    src: "https://img1.wsimg.com/isteam/ip/52c19eb6-1292-49f5-b816-98c777700873/Vertical%20Chest%20Press.jpg",
    alt: "Vertical Chest Press",
    caption: ""
  },
  {
    src: "https://img1.wsimg.com/isteam/ip/52c19eb6-1292-49f5-b816-98c777700873/Long%20Pull%20Row.jpg",
    alt: "Long Pull Row",
    caption:
      "Long Pull Row with large seat and footplate provide better range and lower body stabilization. The unique design allows the use of long and short bars/handles in order to achieve excellent and effective back exercise."
  },
  {
    src: "https://img1.wsimg.com/isteam/ip/52c19eb6-1292-49f5-b816-98c777700873/Pec%20Fly%20or%20Rear%20Delt.jpg",
    alt: "Pec Fly / Rear Delt",
    caption:
      "Pec Fly / Rear Delt is a versatile machine with dual functionality for both chest and rear deltoid muscles. Features independent arm movement, adjustable start position, and a comfortable seat with multiple adjustments for users of all sizes."
  },

  {
    src: "https://img1.wsimg.com/isteam/ip/52c19eb6-1292-49f5-b816-98c777700873/Lat%20Pull%20Down.jpg",
    alt: "Lat Pull Down",
    caption:
      "Lat Pull Down with leg lock is adjustable to make a comfortable sitting positing for an effective workout. Dual strap grips and pull-down bars can be used for isolateral & bilateral movements respectively."
  }
]

// Plate Loaded images and captions (update to match reference site, only valid images)
const plateLoadedImages = [
  {
    src: "https://img1.wsimg.com/isteam/ip/52c19eb6-1292-49f5-b816-98c777700873/45%20Leg%20Press.jpg",
    alt: "45° Leg Press",
    caption:
      "Leg Press with a 45 degree angle for accurate training. Carriage travels on linear bearing for friction free & smooth performance. Big non-skid high quality rubber foot platform. Ergonomic adjustable seat protects lower back. Inbuilt plate holder allows easy loading & unloading of weight plates."
  },
  {
    src: "https://img1.wsimg.com/isteam/ip/52c19eb6-1292-49f5-b816-98c777700873/Power%20Squat.jpg",
    alt: "Power Squat",
    caption:
      "An exceptional machine designed for a complete lower body workout impacting the quads, hamstrings, and glutes. This machine offers an oversized footrest and angled shoulder pads for multiple squats variations, ensuring a safe workout."
  }
]

const Equipment = () => {
  return (
    <div className="bg-black text-white min-h-screen w-full">
      {/* Equipment Categories Sections Only */}
      <section className="w-full py-16 lg:py-24 bg-gradient-to-b from-black via-gray-900/50 to-black">
        <SectionCarousel images={cardioImages} heading="Cardio" />
        <SectionCarousel images={pinLoadedImages} heading="Pin Loaded" />
        <SectionCarousel images={plateLoadedImages} heading="Plate Loaded" />
      </section>
    </div>
  )
}

export default Equipment
