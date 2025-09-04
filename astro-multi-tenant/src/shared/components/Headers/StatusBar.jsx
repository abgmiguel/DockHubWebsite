import { useState } from 'react'

const StatusBar = ({ title, percentage, color }) => {
  // State to track whether the main div is hovered
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="w-full rounded p-0 m-0 pl-5 pr-5"
      onMouseEnter={() => setHovered(true)} // Set hovered to true on mouse enter
      onMouseLeave={() => setHovered(false)} // Reset to original percentage on mouse leave
    >
      <div className="flex justify-between p-0 m-0">
        <div className="text-left text-gray-400 font-semibold p-0 m-0 text-header_smdescpt">
          {title}
        </div>
        <div className="text-right text-gray-400 font-semibold p-0 m-0 text-header_smdescpt">
          {percentage}%
        </div>
      </div>

      <div className="w-full bg-gray-200 h-2 rounded p-0 m-0 mb-0">
        {/* Apply dynamic color class and percentage width */}
        <div
          className={`h-2 rounded ${color}`}
          style={{ width: hovered ? '0%' : `${percentage}%`, transition: 'width 0.5s ease' }} // Set width to 0% on hover
        ></div>
      </div>
    </div>
  )
}

export default StatusBar
