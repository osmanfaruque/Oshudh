import { Link } from "react-router";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4">
              <img src="/icon.png" alt="Oshudh" className="h-10 w-auto" />
              <div className="ml-3">
                <h3 className="text-2xl font-bold text-white">Oshudh</h3>
                <p className="text-sm text-gray-400">Health at Door</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted multi-vendor medicine e-commerce platform. Quality
              healthcare products delivered to your doorstep.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/category/tablet"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Tablets
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Customer Service
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Contact Info
            </h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-medical-primary mr-3" />
                <span className="text-gray-400">
                  123 Health Street, Medical City, BD
                </span>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-medical-primary mr-3" />
                <span className="text-gray-400">+880 1234-567890</span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-medical-primary mr-3" />
                <span className="text-gray-400">info@oshudh.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Oshudh. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Developed by{" "}
              <a
                href="https://github.com/osmanfaruque"
                target="_blank"
                rel="noopener noreferrer"
                className="text-medical-primary font-medium hover:underline"
              >
                osmanfaruque
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
