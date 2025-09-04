const Hero = ({ data = {} }) => {
  const {
    mainText = "Continuously seeking the next challenge...",
    subText = "developer, manager, hardware designer, manufacturing, sales and more...",
    image = {
      src: "/images/cluster.png",
      alt: "Logo",
      width: 450,
      height: 374
    }
  } = data;

  return (
    <section>
      <div className="flex flex-col lg:flex-row w-full  pt-5 pb-8 bg-white animate-in fade-in zoom-in duration-700">
        <div className="flex-1 flex items-center justify-center p-0 m-0 sm:w-0"></div>
        <div className="lg:w-[450px] flex flex-col items-center justify-center text-black  pl-2 lg:pl-0 pb-5 lg:pb-0">
          <div className="m-0 tracking-[-1px] text-budgetpt text-center font-poppins font-extrabold">
            {mainText}
          </div>
          <div className="h-[30px]"></div>
          <div className="p-0 m-0 font-poppins text-pospt text-center tracking-[-.4px] opacity-40 ">
            {subText}
          </div>
        </div>
        <div className="lg:w-[450px] flex items-center justify-center text-black">
          <img src={image.src} alt={image.alt} width={image.width} height={image.height} />
        </div>
        <div className="flex-1 flex items-center justify-center sm:w-0"></div>
      </div>
    </section>
  )
}

export default Hero