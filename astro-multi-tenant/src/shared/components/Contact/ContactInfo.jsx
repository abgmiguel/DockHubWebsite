const ContactInfo = ({ data = {} }) => {
  const {
    name = "Preston Garrison",
    email = "resume@prestongarrison.com",
    phone = "+1 (480) 388-7766",
    followTitle = "Follow Me",
    followDescription = "Connect with me on social media",
    social = []
  } = data;

  return (
    <>
      <div className="h-5"></div>

      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="items-center justify-center text-center font-poppins font-bold text-header_smtitlept pt-5 text-black">
          <p>{name}</p>
        </div>
        <div className="items-center justify-center text-center font-poppins font-bold text-header_descpt">
          <a
            href={`mailto:${email}`}
            className="text-blue-600 font-semibold hover:underline"
          >
            {email}
          </a>
        </div>
        <div className="items-center justify-center text-center font-poppins font-bold text-botpt pb-5 pt-5">
          <a href={`tel:${phone.replace(/\D/g, '')}`} className="text-red-800 font-semibold hover:underline">
            {phone}
          </a>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">{followTitle}</h2>
        <p className="text-lg text-gray-600 mb-8">{followDescription}</p>

        <div className="flex justify-center space-x-6">
          {social.map((platform, index) => (
            <a
              key={index}
              href={platform.url}
              target="_blank"
              className="text-gray-400 hover:text-blue-600"
            >
              <img
                src={platform.icon}
                alt={platform.alt}
                width={40}
                height={40}
              />
            </a>
          ))}
        </div>
      </div>

      <div className="h-96"></div>
    </>
  )
}

export default ContactInfo