'use client' // Marks this as a Client Component

import { useEffect, useRef, useState } from 'react'
import StatusBar from '../Headers/StatusBar.jsx'

const Skills = ({ title, description, color, items = [] }) => {
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const currentRef = ref.current // Store the ref value in a local variable

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true) // Trigger the animation when it enters the viewport
          observer.disconnect() // Stop observing after the first trigger to prevent resetting
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
    <section
      ref={ref}
      className={`flex w-full items-center justify-center m-0 p-0 pt-2 transition-all duration-1000 ${
        hasAnimated
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-[200px] scale-[0.3]'
      }`}
      style={{
        willChange: 'opacity, transform',
        animationFillMode: 'forwards',
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 w-full m-0 p-0 pl-10 pr-10 max-w-[960px]">
        <h3 className="col-span-1 lg:col-span-2 text-black font-nunito text-pospt font-bold m-0 p-0 pl-3 lg:pl-0">
          {title}
        </h3>
        {items.map(item => (
          <StatusBar key={item.id} title={item.title} percentage={item.percentage} color={color} />
        ))}
        <div
          className="col-span-1 lg:col-span-2 pb-2 pt-1 pl-3 pr-3 lg:pl-6 lg:pr-6 flex items-center justify-center text-left text-gray-400 font-poppins text-header_smdescpt"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
    </section>
  )
}

export default Skills
