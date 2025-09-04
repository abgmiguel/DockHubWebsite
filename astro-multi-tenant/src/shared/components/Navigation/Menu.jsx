const Menu = ({ data = {} }) => {
  const {
    brandText = "www.prestongarrison.com",
    links = [
      { href: "/", text: "Home" },
      { href: "/blog", text: "Blog" },
      { href: "/#qualifications", text: "Qualifications" },
      { href: "/#experiences", text: "Experiences" },
      { href: "/#contact", text: "Contact" }
    ]
  } = data;

  return (
    <nav className="bg-surface border-b border-border p-0">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-text-primary text-header_smdescpt font-poppins">{brandText}</div>
        <div className="md:hidden">
          <button
            className="text-text-primary focus:outline-none"
            id="menu-toggle"
            onClick={() => {
              const mobileMenu = document.getElementById('mobile-menu')
              if (mobileMenu) {
                mobileMenu.classList.toggle('hidden')
              }
            }}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
        <ul className="hidden md:flex space-x-6">
          {links.map((link, index) => (
            <li key={index}>
              <a href={link.href} className="text-text-secondary hover:text-link-hover font-poppins">
                {link.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="md:hidden">
        <ul className="hidden bg-surface-hover mt-2 py-2 px-4 space-y-2" id="mobile-menu">
          {links.map((link, index) => (
            <li key={index}>
              <a href={link.href} className="block text-text-secondary hover:text-link-hover font-poppins">
                {link.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default Menu