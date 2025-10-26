import React from "react";
import { FaUserMd, FaShieldAlt, FaClock, FaAward } from "react-icons/fa";
import { Link } from "react-router";

const AboutSection = () => {
  const features = [
    {
      icon: <FaUserMd className="text-4xl text-primary" />,
      title: "Expert Pharmacists",
      description:
        "Licensed pharmacists verify every medicine for your safety and health.",
    },
    {
      icon: <FaShieldAlt className="text-4xl text-secondary" />,
      title: "Quality Assurance",
      description:
        "All medicines are sourced from verified manufacturers and suppliers.",
    },
    {
      icon: <FaClock className="text-4xl text-accent" />,
      title: "24/7 Service",
      description:
        "Round-the-clock support for all your healthcare needs and queries.",
    },
    {
      icon: <FaAward className="text-4xl text-warning" />,
      title: "Trusted Brand",
      description:
        "Serving thousands of customers with reliable healthcare solutions.",
    },
  ];

  return (
    <section id="why-choose-us" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-white via-blue-50 to-green-50 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="heading-primary mb-3 sm:mb-4">
            Why Choose Oshudh? 💊
          </h2>
          <p className="text-body max-w-3xl mx-auto">
            Your trusted partner for quality healthcare products delivered right
            to your door. We ensure safe, effective, and affordable medicines
            for you and your family.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16 lg:mb-20">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="medical-card p-5 sm:p-6 lg:p-8 h-full hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 bg-white">
                <div className="mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                  <div className="text-4xl sm:text-5xl lg:text-6xl">{feature.icon}</div>
                </div>
                <h4 className="heading-tertiary mb-2 sm:mb-3">
                  {feature.title}
                </h4>
                <p className="text-small leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* About Content & Stats */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h3 className="heading-secondary text-blue-600 mb-4 sm:mb-6">
              Health at Your Door 🏥
            </h3>
            <div className="space-y-4 sm:space-y-5">
              <p className="text-body">
                <strong className="text-blue-600">Oshudh</strong> is Bangladesh's
                leading online pharmacy platform, committed to making healthcare
                accessible to everyone. We bridge the gap between patients and
                quality medicines through our reliable delivery network.
              </p>
              <p className="text-body">
                Our mission is to ensure that no one has to compromise on their
                health due to unavailability or high costs of medicines. With
                verified products from trusted manufacturers, we guarantee
                authentic healthcare solutions.
              </p>
              <p className="text-body">
                From tablets to syrups, capsules to injections - we offer a
                comprehensive range of medicines with expert consultation and
                doorstep delivery across Bangladesh.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="medical-card p-4 sm:p-6 text-center bg-white hover:shadow-xl transition-shadow">
              <div className="heading-secondary text-blue-600 mb-1 sm:mb-2">10K+</div>
              <div className="text-small font-medium">Happy Customers</div>
            </div>
            <div className="medical-card p-4 sm:p-6 text-center bg-white hover:shadow-xl transition-shadow">
              <div className="heading-secondary text-green-600 mb-1 sm:mb-2">500+</div>
              <div className="text-small font-medium">Medicines Available</div>
            </div>
            <div className="medical-card p-4 sm:p-6 text-center bg-white hover:shadow-xl transition-shadow">
              <div className="heading-secondary text-purple-600 mb-1 sm:mb-2">24/7</div>
              <div className="text-small font-medium">Customer Support</div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-8 sm:mt-10 lg:mt-12">
            <Link to="/shop" className="medical-btn-primary text-base sm:text-lg px-6 sm:px-8 lg:px-10 py-3 sm:py-4 inline-block">
              Start Shopping 🛒
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
