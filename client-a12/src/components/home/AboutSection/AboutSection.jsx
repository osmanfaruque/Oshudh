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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">About Oshudh</h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Your trusted partner for quality healthcare products delivered right
            to your door. We ensure safe, effective, and affordable medicines
            for you and your family.
          </p>
        </div>

        {/* About Content */}
        <div className="flex flex-col md:flex-row justify-center items-center mb-16">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-3xl font-bold text-primary mb-6">
              Health at Your Door 🏥
            </h3>
            <div className="space-y-4 text-gray-600">
              <p className="text-lg leading-relaxed">
                <strong className="text-primary">Oshudh</strong> is Bangladesh's
                leading online pharmacy platform, committed to making healthcare
                accessible to everyone. We bridge the gap between patients and
                quality medicines through our reliable delivery network.
              </p>
              <p className="text-lg leading-relaxed">
                Our mission is to ensure that no one has to compromise on their
                health due to unavailability or high costs of medicines. With
                verified products from trusted manufacturers, we guarantee
                authentic healthcare solutions.
              </p>
              <p className="text-lg leading-relaxed">
                From tablets to syrups, capsules to injections - we offer a
                comprehensive range of medicines with expert consultation and
                doorstep delivery across Bangladesh.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">500+</div>
                <div className="text-sm text-gray-600">Medicines Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">24/7</div>
                <div className="text-sm text-gray-600">Customer Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="medical-card p-6 h-full hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="medical-nav text-white rounded-2xl p-8">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Experience Better Healthcare? 🌟
            </h3>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of satisfied customers who trust Oshudh for their
              medicine needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop" className="btn btn-white btn-lg">Start Shopping</Link>
              <button className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
