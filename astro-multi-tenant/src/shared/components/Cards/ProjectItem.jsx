'use client'

import { useEffect, useRef, useState } from 'react'
// Removed Next.js Image import

const ProjectItem = ({ image_name, image_desc, title, desc }) => {
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const currentRef = ref.current // Store the ref value in a local variable

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true) // Trigger the animation when it enters the viewport
          observer.disconnect() // Optionally stop observing after the first trigger
        }
      },
      {
        threshold: 0.1, // Lower threshold for earlier triggering (test different values)
        rootMargin: '0px 0px 100px 0px', // Expand the viewport for earlier detection (test larger margins if needed)
      },
    )

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef) // Use the local variable in cleanup
      }
    }
  }, []) // No need to add `ref.current` to the dependency array

  return (
    <div
      ref={ref}
      className={`bg-white flex flex-col items-center justify-center text-center pt-0 pl-2 pr-2 pb-0 transition-all duration-1000 ${
        hasAnimated
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-[200px] scale-[0.3]'
      }`}
      style={{
        willChange: 'opacity, transform',
        animationFillMode: 'forwards',
      }}
    >
      <div className="bg-white mb-2 flex items-end justify-center h-[150px]">
        <img
          src={image_name}
          alt={image_desc}
          height={150}
          width={150}
          className="max-w-full object-cover"
        />
      </div>
      <div className="bg-white mb-2 flex items-center justify-center h-[50px] w-full">
        <h3 className="font-poppins text-pospt font-medium text-black capitalize">{title}</h3>
      </div>
      <div className="bg-white flex items-start justify-center font-poppins text-header_smdescpt text-gray-500 font-medium h-[120px] w-full">
        <p>{desc}</p>
      </div>
    </div>
  )
}

export default ProjectItem
