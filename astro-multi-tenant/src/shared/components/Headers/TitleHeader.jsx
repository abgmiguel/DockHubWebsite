'use client'

import { useEffect, useRef, useState } from 'react'
// Removed Next.js Image import

const TitleHeader = ({ title, description, image, imageDesc }) => {
  const [isVisible, setIsVisible] = useState(false)


  return (
    <div className="flex flex-col md:flex-row w-full bg-black pt-2 pb-5">
      <div className="flex-1 flex items-center justify-center sm:w-0"></div>
      <div className="md:w-[600px] flex items-center justify-center text-white bg-black">
        <div className="h-full w-full flex flex-col justify-center">
          <div className="flex-1 flex items-center justify-center pt-5 md:pt-0">
            <h2 className="text-header_smtitlept font-poppins font-bold text-center md:text-header_titlept">{title}</h2>
          </div>

          <div className="flex-1 flex items-center justify-center font-poppins italic text-header_smdescpt md:text-header_descpt text-center pl-5 pr-5 md:pt-0 md:pl-0 md:pr-0">
            {description}
          </div>
        </div>
      </div>

      <div className="md:w-[200px] flex items-center justify-center text-white">
        <img
          src={image}
          alt={imageDesc}
          height={200}
          width={200}
          style={{ width: 'auto', height: 'auto' }}
          className="max-w-full object-cover"
        />
      </div>

      <div className="flex-1 flex items-center justify-center sm:w-0"></div>
    </div>
  )
}

export default TitleHeader
