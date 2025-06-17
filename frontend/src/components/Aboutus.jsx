"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import Typewriter from "typewriter-effect"
import { ChevronLeft, ChevronRight } from "lucide-react"

const AboutUs = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [locations, setLocations] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)

  const getAllResources = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`http://3.25.86.182:5000/api/Admin/AllResources`)
      setResources(response.data)
      setLocations(response.data.find((resource) => resource.title === "ABOUT_US")?.customResource)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllResources()
  }, [])

  // Gym facility images for the gallery
  const gymImages = [
    {
      id: "gym1",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-04-25%20at%2013.49.43_73d235e6.jpg-8BBKETnJQ6KodRGRcWJSvhqXgevjMo.jpeg",
      title: "State-of-the-Art Equipment",
      address: "Main Training Floor",
      description:
        "Our premium strength training equipment is designed for maximum results and safety. Each machine is regularly maintained to ensure optimal performance.",
    },
    {
      id: "gym2",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-04-25%20at%2013.49.18_3e6725a4.jpg-B4N48Im0i2A5YXw0hqXuKQ1eOj2VUm.jpeg",
      title: "#WeTrainLikeFamily",
      address: "Motivation Zone",
      description:
        "Our signature wall reminds us that fitness is a journey we take together. At Fit Nest, we believe in building a community that supports each other's goals.",
    },
    {
      id: "gym3",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-04-25%20at%2013.50.06_ff7f3e54.jpg-jNE6yJIKJOkWycJnVUlnVnIwsiSwM5.jpeg",
      title: "Functional Training Area",
      address: "Central Workout Space",
      description:
        "Our cable machine section offers versatile workout options for all fitness levels. Perfect for building strength, improving flexibility, and enhancing overall athletic performance.",
    },
    {
      id: "gym4",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-04-25%20at%2013.50.31_9d05626f.jpg-G0ys2ci9EGxLchp3emlUf7QeydKdTV.jpeg",
      title: "Queen of the Gym",
      address: "Women's Training Section",
      description:
        "A dedicated space designed to empower women in their fitness journey. Our specialized equipment and motivational environment help you achieve your fitness goals.",
    },
  ]

  // Equipment images for the slideshow
  const equipmentImages = [
    {
      id: "eq1",
      image: "/images/IMG_4095=ok.jpg",
      title: "Premium Strength Training Zone",
      description:
        "Our main training floor features the latest strength training equipment for all your fitness needs.",
    },
    {
      id: "eq2",
      image: "/images/IMG_4085=ok.JPG",
      title: "Motivation Zone",
      description: "Train with inspiration in our motivation zone featuring our signature Fit Nest wall art.",
    },
    {
      id: "eq3",
      image: "/images/IMG_4080=ok.JPG",
      title: "Cable Machine Area",
      description:
        "Our versatile cable machine section allows for countless exercise variations to target every muscle group.",
    },
    {
      id: "eq4",
      image: "/images/IMG_4077=ok.JPG",
      title: "Cardio Section",
      description: "State-of-the-art cardio equipment to keep you motivated during your workout.",
    },
    {
      id: "eq5",
      image: "/images/IMG_4074=ok.JPG",
      title: "Free Weights Area",
      description: "Comprehensive dumbbell selection ranging from 2kg to 50kg to suit all strength levels.",
    },
    {
      id: "eq6",
      image: "/images/IMG_4090=ok.JPG",
      title: "Machine Training Zone",
      description: "Targeted machine exercises for precise muscle development in our spacious training zone.",
    },
    {
      id: "eq7",
      image: "/images/IMG_4073=ok.JPG",
      title: "Dumbbell Station",
      description:
        "Clear your mind of can't! Our premium dumbbell station is perfect for all your free weight exercises.",
    },
    {
      id: "eq8",
      image: "/images/IMG_4081=ok.JPG",
      title: "Queen of the Gym Area",
      description: "A dedicated space designed to empower women in their fitness journey with specialized equipment.",
    },
    {
      id: "eq9",
      image: "/images/IMG_4078=ok.JPG",
      title: "Cardio and Strength Zone",
      description: "Our integrated cardio and strength zone allows for efficient circuit training sessions.",
    },
    {
      id: "eq10",
      image: "/images/IMG_4083=ok.JPG",
      title: "Premium Leg Press Station",
      description: "Build powerful lower body strength with our premium leg press machines and squat racks.",
    },
  ]

  // Function to navigate to the next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === equipmentImages.length - 1 ? 0 : prev + 1))
  }

  // Function to navigate to the previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? equipmentImages.length - 1 : prev - 1))
  }

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [currentSlide])

  if (loading) {
    return <div>Loading...</div>
  }

  // Combine API locations with our static gym images
  const allLocations = locations ? [...locations, ...gymImages] : gymImages

  return (
    <div className="bg-black text-white py-10 px-5 font-sans">
      {/* Page Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}  
      >
        <h1 className="text-5xl font-extrabold drop-shadow-lg text-white">About Us</h1>
        <p className="text-green-400 text-center text-xl mb-6 space-x-0"></p>
        <div className="border-b-4 border-green-400 w-20 mx-auto mb-12"></div>

        <p className="text-gray-400 mt-4 text-lg max-w-3xl mx-auto">
          Welcome to Fit Nest! We combine cutting-edge fitness solutions, expert training, and a community-driven
          approach to help you achieve your health and fitness goals.
        </p>
      </motion.div>

      {/* Gym Overview Section */}
      <motion.div
        className="flex flex-col md:flex-row items-center bg-black shadow-xl rounded-lg overflow-hidden mb-12 border border-black"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
        <img
          src={locations && locations[2]?.image} // Replace with a real image URL
          alt="Our Gym"
          className="w-full md:w-1/2 h-64 object-cover"
        />
        <div className="p-6 md:w-1/2">
          <h2 className="text-3xl font-bold text-white mb-4">
            Experience the <span className="text-green-500">Fit Nest</span> Difference
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed">
            Fit Nest is more than just a gym. It's a space designed to empower, inspire, and transform. With
            cutting-edge equipment, expert trainers, and a welcoming community, we provide everything you need to
            succeed in your fitness journey.
          </p>
          <p className="text-gray-400 mt-4 text-lg leading-relaxed">
            <Typewriter
              options={{
                strings: [
                  "Whether you're a beginner or a fitness enthusiast, our personalized programs and state-of-the-art facilities are here to support your goals.",
                  "Join us and discover a better way to train.",
                ],
                autoStart: true,
                loop: true,
                delay: 5, // Optional: Adjust the typing speed
              }}
            />
          </p>
        </div>
      </motion.div>

      {/* Locations Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="mb-20"
      >
        <h2 className="text-4xl font-extrabold text-white text-center mb-2 drop-shadow-lg">Fitness Gallery</h2>
        <p className="text-green-400 text-center text-xl mb-6">Experience our world-class facilities</p>
        <div className="border-b-4 border-green-400 w-20 mx-auto mb-12"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allLocations &&
            allLocations.slice(0, 3).map((location) => (
              <motion.div
                key={location.id}
                className="bg-black shadow-lg rounded-lg overflow-hidden shadow-green-800"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <img
                  src={location.image || "/placeholder.svg"}
                  alt={location.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-extrabold text-green-400 mb-2">{location.title}</h3>
                  <p className="text-gray-400 text-lg font-roboto">{location.address}</p>
                  <p className="text-gray-400 mt-3 font-lato text-sm leading-relaxed">{location.description}</p>
                </div>
              </motion.div>
            ))}
        </div>
      </motion.div>

      {/* Equipment Showcase Section */}
      <motion.div
        className="mt-20 mb-16"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <h2 className="text-4xl font-extrabold text-white text-center mb-2 drop-shadow-lg">Our Premium Equipment</h2>
        <p className="text-green-400 text-center text-xl mb-6">Train with the best to be the best</p>
        <div className="border-b-4 border-green-400 w-20 mx-auto mb-12"></div>

        {/* Equipment Slideshow */}
        <div className="relative w-full overflow-hidden rounded-xl shadow-2xl shadow-green-900/30 h-[500px] bg-black">
          {/* Slideshow Images */}
          {equipmentImages.map((equipment, index) => (
            <motion.div
              key={equipment.id}
              className={`absolute inset-0 w-full h-full ${index === currentSlide ? "z-10" : "z-0"}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentSlide ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="relative w-full h-full">
                <img
                  src={equipment.image || "/placeholder.svg"}
                  alt={equipment.title}
                  className="w-full h-full object-cover object-center brightness-150 contrast-125"
                  style={{ filter: "saturate(1.5)" }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-40"></div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: index === currentSlide ? 1 : 0, y: index === currentSlide ? 0 : 20 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3 className="text-3xl font-bold text-white mb-3">{equipment.title}</h3>
                  <p className="text-gray-200 text-lg max-w-3xl">{equipment.description}</p>
                </motion.div>
              </div>
            </motion.div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-green-600/80 hover:bg-green-600 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-green-600/80 hover:bg-green-600 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-wrap justify-center gap-2 max-w-md">
            {equipmentImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-green-500 w-8" : "bg-white/60 w-2"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AboutUs
