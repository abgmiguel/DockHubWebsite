import TitleHeader from '../Headers/TitleHeader.jsx'

const ContactHeader = ({ data = {} }) => {
  const {
    title = "Contact Me",
    description = 'I look forward to any and all future projects. Let me help take your companies ideas to the next level.',
    image = "/images/envelope.png",
    imageDesc = "Envelope"
  } = data;

  return (
    <TitleHeader
      title={title}
      description={description}
      image={image}
      imageDesc={imageDesc}
    />
  )
}

export default ContactHeader