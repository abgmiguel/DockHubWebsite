const MainTitleHeader = ({ data = {} }) => {
  const { title = "Preston Garrison" } = data;
  
  return (
    <div className="flex flex-row w-full bg-black pt-1 pb-1">
      <div className="flex-1 sm:w-0"></div>
      <div className="md:w-[600px] text-white flex-none font-poppins font-bold text-center pt-5 md:pt-0">
        <h1 className="text-header_smtitlept md:text-header_titlept">{title}</h1>
      </div>
      <div className="flex-1 sm:w-0"></div>
    </div>
  );
};

export default MainTitleHeader;
