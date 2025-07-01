import React from 'react';
import { FaInstagram, FaTiktok, FaFacebook, FaWhatsapp } from 'react-icons/fa';

const SocialLinks = () => {
  const socialMedia = [
    { icon: <FaInstagram />, href: 'https://instagram.com', name: 'Instagram', color: 'text-[#E1306C]' },
    { icon: <FaTiktok />, href: 'https://tiktok.com', name: 'TikTok', color: 'text-white' }, // Using white for TikTok for best visibility on a dark background
    { icon: <FaFacebook />, href: 'https://facebook.com', name: 'Facebook', color: 'text-[#1877F2]' },
    { icon: <FaWhatsapp />, href: 'https://wa.me/1234567890', name: 'WhatsApp', color: 'text-[#25D366]' }, // Replace with your WhatsApp number
  ];

  return (
    <div className="py-12">
      <h2 className="text-center text-3xl font-bold text-white mb-8">Síguenos en Nuestras Redes</h2>
      <div className="flex justify-center items-center space-x-6 md:space-x-8">
        {socialMedia.map((social) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.name}
            className={`${social.color} transform hover:scale-125 transition-all duration-300`}
          >
            <div className="text-4xl md:text-5xl">{social.icon}</div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialLinks;
