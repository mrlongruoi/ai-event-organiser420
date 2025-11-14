import { Instagram, Mail, Twitter, Youtube } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-800/50 py-8 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-6 text-sm text-gray-400">
        Made with ❤️ by RoadsideCoder
      </div>

      <div className="flex gap-4 items-center">
        <a
          href="https://www.youtube.com/roadsidecoder"
          className="text-gray-400"
        >
          <Youtube />
        </a>
        <a
          href="https://www.instagram.com/roadsidecoder"
          className="text-gray-400"
        >
          <Instagram className="w-5 h-5" />
        </a>
        <a href="https://x.com/Piyush_eon" className="text-gray-400">
          <Twitter className="w-5 h-5" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
