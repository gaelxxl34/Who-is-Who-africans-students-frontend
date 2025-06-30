'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Define interfaces for our data types
interface Testimonial {
  quote: string;
  name: string;
  position: string;
  university: string;
}

const HomePage: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  // Close mobile menu when clicking outside
  const navRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle scroll to section
  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerHeight = 80; // Approximate header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  
  const testimonials: Testimonial[] = [
    {
      quote: "Who is Who Educhain has transformed how we verify academic credentials. The blockchain technology ensures security and reliability.",
      name: "Dr. Sarah Mensah",
      position: "Registrar",
      university: "University of Ghana"
    },
    {
      quote: "Since implementing this platform, credential fraud has decreased by 85%. It's an essential tool for modern universities in Africa.",
      name: "Prof. Chike Okonkwo",
      position: "Vice Chancellor",
      university: "University of Lagos"
    },
    {
      quote: "The speed and efficiency of verification has impressed both our staff and employers. A truly revolutionary platform for academic integrity.",
      name: "Dr. Amina Diallo",
      position: "Dean of Students",
      university: "University of Nairobi"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header & Navigation */}
      <header className="fixed w-full bg-white bg-opacity-95 shadow-sm z-50" ref={navRef}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-900">
                <span className="text-green-700">Who is Who</span> <span className="hidden xs:inline">Educhain</span>
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => scrollToSection('how-it-works')} 
                className="text-gray-700 hover:text-blue-900 transition duration-300 whitespace-nowrap"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('why-choose-us')} 
                className="text-gray-700 hover:text-blue-900 transition duration-300 whitespace-nowrap"
              >
                Why Choose Us
              </button>
              <button 
                onClick={() => scrollToSection('universities')} 
                className="text-gray-700 hover:text-blue-900 transition duration-300 whitespace-nowrap"
              >
                Universities
              </button>
              <button 
                onClick={() => scrollToSection('student-advantage')} 
                className="text-gray-700 hover:text-blue-900 transition duration-300 whitespace-nowrap"
              >
                For Students
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="text-gray-700 hover:text-blue-900 transition duration-300 whitespace-nowrap"
              >
                Contact
              </button>
            </nav>
            
            <div className="flex items-center space-x-4">
              {/* Login and Get Started buttons - visible only on medium screens and up */}
              <Link href="/login" className="hidden md:block text-blue-900 hover:text-blue-700 transition duration-300 whitespace-nowrap cursor-pointer">
                Login
              </Link>
              <Link href="/register" className="hidden md:block bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800 transition duration-300 whitespace-nowrap cursor-pointer">
                Get Started
              </Link>
              
              {/* Mobile menu button - always visible */}
              <button 
                className="md:hidden text-gray-700 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  // Close icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  // Menu icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-200 animate-fadeIn">
              <div className="flex flex-col space-y-4">
                <button 
                  onClick={() => scrollToSection('how-it-works')} 
                  className="text-gray-700 hover:text-blue-900 transition duration-300 py-2"
                >
                  How It Works
                </button>
                <button 
                  onClick={() => scrollToSection('why-choose-us')} 
                  className="text-gray-700 hover:text-blue-900 transition duration-300 py-2"
                >
                  Why Choose Us
                </button>
                <button 
                  onClick={() => scrollToSection('universities')} 
                  className="text-gray-700 hover:text-blue-900 transition duration-300 py-2"
                >
                  Universities
                </button>
                <button 
                  onClick={() => scrollToSection('student-advantage')} 
                  className="text-gray-700 hover:text-blue-900 transition duration-300 py-2"
                >
                  For Students
                </button>
                <button 
                  onClick={() => scrollToSection('contact')} 
                  className="text-gray-700 hover:text-blue-900 transition duration-300 py-2"
                >
                  Contact
                </button>
                {/* Add Login and Get Started buttons to mobile menu */}
                <div className="pt-4 border-t border-gray-200 flex flex-col space-y-3">
                  <Link href="/login" className="text-center text-blue-900 hover:text-blue-700 transition duration-300 py-2">
                    Login
                  </Link>
                  <Link href="/register" className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition duration-300 text-center">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen relative overflow-hidden flex items-center">
        <div className="absolute inset-0">
          {/* Use the local hero image from public folder */}
          <div className="relative w-full h-full">
            <Image
              src="/images/hero.jpg"
              alt="Academic verification platform"
              fill
              priority
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-900/80 to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="w-full lg:w-1/2 py-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Africa's Trusted Blockchain for Academic Verification
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Verify student credentials in seconds. Combat fraud. Build trust.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="bg-white text-blue-900 px-8 py-3 rounded-lg hover:bg-blue-50 transition duration-300 font-medium shadow-lg whitespace-nowrap cursor-pointer">
                Get Started
              </Link>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white/10 transition duration-300 font-medium whitespace-nowrap cursor-pointer">
                Request Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our blockchain technology makes credential verification simple, secure, and reliable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition duration-300 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
              <div className="text-blue-700 mb-4">
                {/* Replace Font Awesome with SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Upload Credentials</h3>
              <p className="text-gray-600">Universities securely upload verified student credentials to the platform.</p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition duration-300 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
              <div className="text-blue-700 mb-4">
                {/* Replace Font Awesome with SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Blockchain Verification</h3>
              <p className="text-gray-600">Each credential is encrypted and stored on our secure blockchain network.</p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition duration-300 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
              <div className="text-blue-700 mb-4">
                {/* Replace Font Awesome with SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zm0 20l10-5-10-5-10 5 10 5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Secure Storage</h3>
              <p className="text-gray-600">Credentials are permanently stored and protected against tampering.</p>
            </div>
            
            {/* Step 4 */}
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition duration-300 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">4</div>
              <div className="text-blue-700 mb-4">
                {/* Replace Font Awesome with SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h-4v-4H7l5-5 5 5h-4v4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Instant Access</h3>
              <p className="text-gray-600">Employers and institutions can verify credentials in seconds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-choose-us" className="py-20 bg-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform offers unparalleled security, efficiency, and reliability for academic verification.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition duration-300">
              <div className="text-green-600 mb-4">
                <i className="fas fa-lock text-4xl"></i>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Blockchain Security</h3>
              <p className="text-gray-600 mb-4">
                Immutable blockchain technology ensures credentials cannot be forged or tampered with, providing the highest level of security.
              </p>
              <a href="#" className="text-blue-700 hover:text-blue-900 font-medium inline-flex items-center cursor-pointer">
                Learn More <i className="fas fa-arrow-right ml-2"></i>
              </a>
            </div>
            {/* Benefit 2 */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition duration-300">
              <div className="text-green-600 mb-4">
                <i className="fas fa-bolt text-4xl"></i>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Speed & Efficiency</h3>
              <p className="text-gray-600 mb-4">
                Verify credentials in seconds, not days. Our platform streamlines the verification process for universities and employers.
              </p>
              <a href="#" className="text-blue-700 hover:text-blue-900 font-medium inline-flex items-center cursor-pointer">
                Learn More <i className="fas fa-arrow-right ml-2"></i>
              </a>
            </div>
            {/* Benefit 3 */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition duration-300">
              <div className="text-green-600 mb-4">
                <i className="fas fa-university text-4xl"></i>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">University Network</h3>
              <p className="text-gray-600 mb-4">
                Join a growing network of prestigious African universities committed to academic integrity and innovation.
              </p>
              <a href="#" className="text-blue-700 hover:text-blue-900 font-medium inline-flex items-center cursor-pointer">
                Learn More <i className="fas fa-arrow-right ml-2"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section id="universities" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Trusted Across Africa</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leading universities and institutions rely on our platform for secure credential verification.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            <div className="group p-4 bg-white rounded-lg hover:shadow-xl transition duration-300 cursor-pointer">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center grayscale group-hover:grayscale-0 transition duration-300">
                  <i className="fas fa-university text-4xl text-blue-700"></i>
                  <span className="ml-2 text-gray-700 font-medium">University of Ghana</span>
                </div>
                <span className="mt-2 text-sm text-green-600 opacity-0 group-hover:opacity-100 transition duration-300">
                  <i className="fas fa-check-circle mr-1"></i>Accredited
                </span>
              </div>
            </div>
            <div className="group p-4 bg-white rounded-lg hover:shadow-xl transition duration-300 cursor-pointer">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center grayscale group-hover:grayscale-0 transition duration-300">
                  <i className="fas fa-university text-4xl text-blue-700"></i>
                  <span className="ml-2 text-gray-700 font-medium">University of Lagos</span>
                </div>
                <span className="mt-2 text-sm text-green-600 opacity-0 group-hover:opacity-100 transition duration-300">
                  <i className="fas fa-check-circle mr-1"></i>Accredited
                </span>
              </div>
            </div>
            <div className="group p-4 bg-white rounded-lg hover:shadow-xl transition duration-300 cursor-pointer">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center grayscale group-hover:grayscale-0 transition duration-300">
                  <i className="fas fa-university text-4xl text-blue-700"></i>
                  <span className="ml-2 text-gray-700 font-medium">University of Nairobi</span>
                </div>
                <span className="mt-2 text-sm text-green-600 opacity-0 group-hover:opacity-100 transition duration-300">
                  <i className="fas fa-check-circle mr-1"></i>Accredited
                </span>
              </div>
            </div>
            <div className="group p-4 bg-white rounded-lg hover:shadow-xl transition duration-300 cursor-pointer">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center grayscale group-hover:grayscale-0 transition duration-300">
                  <i className="fas fa-university text-4xl text-blue-700"></i>
                  <span className="ml-2 text-gray-700 font-medium">Cairo University</span>
                </div>
                <span className="mt-2 text-sm text-green-600 opacity-0 group-hover:opacity-100 transition duration-300">
                  <i className="fas fa-check-circle mr-1"></i>Accredited
                </span>
              </div>
            </div>
            <div className="group p-4 bg-white rounded-lg hover:shadow-xl transition duration-300 cursor-pointer">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center grayscale group-hover:grayscale-0 transition duration-300">
                  <i className="fas fa-university text-4xl text-blue-700"></i>
                  <span className="ml-2 text-gray-700 font-medium">University of Cape Town</span>
                </div>
                <span className="mt-2 text-sm text-green-600 opacity-0 group-hover:opacity-100 transition duration-300">
                  <i className="fas fa-check-circle mr-1"></i>Accredited
                </span>
              </div>
            </div>
            <div className="group p-4 bg-white rounded-lg hover:shadow-xl transition duration-300 cursor-pointer">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center grayscale group-hover:grayscale-0 transition duration-300">
                  <i className="fas fa-university text-4xl text-blue-700"></i>
                  <span className="ml-2 text-gray-700 font-medium">Addis Ababa University</span>
                </div>
                <span className="mt-2 text-sm text-green-600 opacity-0 group-hover:opacity-100 transition duration-300">
                  <i className="fas fa-check-circle mr-1"></i>Accredited
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Student Advantage */}
      <section id="student-advantage" className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">The Student Advantage</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering students with secure, verifiable credentials for a brighter future.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition duration-300">
              <div className="text-blue-600 mb-4">
                <i className="fas fa-certificate text-4xl"></i>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Instant Proof of Credentials</h3>
              <p className="text-gray-600">
                Share your verified academic achievements instantly with employers and institutions worldwide.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition duration-300">
              <div className="text-blue-600 mb-4">
                <i className="fas fa-globe-africa text-4xl"></i>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Global Opportunities</h3>
              <p className="text-gray-600">
                Access international opportunities with instantly verifiable credentials trusted worldwide.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition duration-300">
              <div className="text-blue-600 mb-4">
                <i className="fas fa-shield-alt text-4xl"></i>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Tamper-Proof Records</h3>
              <p className="text-gray-600">
                Your academic achievements are permanently secured on the blockchain, protected from fraud.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">What Universities Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from academic institutions that have transformed their credential verification process.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Testimonial Cards */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500" 
                  style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="w-full flex-shrink-0 px-4">
                      <div className="bg-white rounded-xl p-8 shadow-md">
                        <div className="text-blue-700 mb-4">
                          {/* Replace Font Awesome with SVG */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                          </svg>
                        </div>
                        <p className="text-gray-700 text-lg mb-6 italic">
                          "{testimonial.quote}"
                        </p>
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center">
                            {/* Replace Font Awesome with SVG */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h4 className="font-bold text-blue-900">{testimonial.name}</h4>
                            <p className="text-gray-600">{testimonial.position}, {testimonial.university}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Navigation Dots */}
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 cursor-pointer ${
                      activeTestimonial === index ? 'bg-blue-700' : 'bg-gray-300'
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://readdy.ai/api/search-image?query=Abstract%20African%20pattern%20with%20geometric%20shapes%20and%20symbols%20in%20a%20modern%20minimalist%20style%2C%20subtle%20and%20elegant%20design%20elements%20that%20represent%20African%20heritage%20and%20innovation%2C%20seamless%20pattern%20suitable%20for%20background%2C%20light%20blue%20and%20white%20color%20scheme&width=1200&height=600&seq=pattern-bg-1&orientation=landscape"
              alt="Abstract African pattern"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to join Africa's leading academic verification network?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Whether you're a university looking to secure your credentials or an employer seeking to verify them, we have the solution for you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register" className="bg-white text-blue-900 px-8 py-3 rounded-lg hover:bg-blue-50 transition duration-300 font-medium shadow-md whitespace-nowrap cursor-pointer">
                Join as University
              </Link>
              <Link href="/register" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-medium shadow-md whitespace-nowrap cursor-pointer">
                Verify Credentials
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-blue-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-bold mb-4">Who is Who Educhain</h3>
              <p className="text-blue-100 mb-4">
                Africa's trusted blockchain for academic verification, building trust and eliminating fraud.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-blue-100 hover:text-white transition cursor-pointer">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-blue-100 hover:text-white transition cursor-pointer">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="#" className="text-blue-100 hover:text-white transition cursor-pointer">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="text-blue-100 hover:text-white transition cursor-pointer">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
            {/* Solutions */}
            <div>
              <h3 className="text-xl font-bold mb-4">Solutions</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-100 hover:text-white transition cursor-pointer">For Universities</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition cursor-pointer">For Employers</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition cursor-pointer">For Students</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition cursor-pointer">API Integration</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition cursor-pointer">Blockchain Technology</a></li>
              </ul>
            </div>
            {/* Resources */}
            <div>
              <h3 className="text-xl font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-100 hover:text-white transition cursor-pointer">Blog</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition cursor-pointer">Case Studies</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition cursor-pointer">Documentation</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition cursor-pointer">Webinars</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition cursor-pointer">Support</a></li>
              </ul>
            </div>
            {/* Contact */}
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <i className="fas fa-map-marker-alt mt-1 mr-2"></i>
                  <span className="text-blue-100">123 Innovation Way, Accra, Ghana</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-envelope mt-1 mr-2"></i>
                  <span className="text-blue-100">info@whoiswhoeduchain.com</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-phone mt-1 mr-2"></i>
                  <span className="text-blue-100">+233 123 456 789</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-blue-800 text-center md:flex md:justify-between md:items-center">
            <p className="text-blue-200 mb-4 md:mb-0">
              &copy; 2025 Who is Who Educhain. All rights reserved.
            </p>
            <div className="flex justify-center md:justify-end space-x-4">
              <a href="#" className="text-blue-200 hover:text-white transition cursor-pointer">Privacy Policy</a>
              <a href="#" className="text-blue-200 hover:text-white transition cursor-pointer">Terms of Service</a>
              <div className="flex items-center text-green-400">
                <i className="fas fa-link mr-1"></i>
                <span>Powered by Blockchain</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;