"use client";

import React, { useState } from "react";

const faqs = [
  {
    question: "What services does BizzMaker provide?",
    answer: "We offer a 360-degree approach to digital growth, including SEO, Google Ads & PPC, Facebook & Instagram Marketing, Website Design, Branding, and AI Video Production."
  },
  {
    question: "How much do your marketing services cost?",
    answer: "Our services are highly affordable and tailored for growing businesses. Pricing starts as low as ₹500 for 10 Social Media Graphics, ₹599 for AI Videos, ₹3,000 for Meta Ads, ₹5,000 for Website Development, ₹6,000 for Professional Reel Shoots, ₹7,500 for Google Ads Management, and ₹20,000 for our complete Brand Development Program."
  },
  {
    question: "What makes BizzMaker different?",
    answer: "We combine expert human strategy with AI-assisted research and performance tracking. This ensures transparent reporting, rapid execution, and proven ROI for our clients."
  },
  {
    question: "Do you work with local businesses or just large brands?",
    answer: "We partner with startups, local businesses, service brands, and growth-focused companies of all sizes looking to scale their digital presence."
  },
  {
    question: "How secure is my payment?",
    answer: "Your security is our top priority. We use industry-standard 256-bit encryption and partner with trusted, PCI-compliant payment gateways. We never store your credit card or sensitive financial information directly on our servers."
  },
  {
    question: "What are the biggest advantages of working with BizzMaker?",
    answer: "Working with us gives you the agility of a boutique agency with the power of an enterprise. Our biggest advantages are our AI-driven predictive strategies, 100% transparent live reporting, rapid campaign execution, and a dedicated team of growth experts obsessed with your ROI."
  },
  {
    question: "How do I get started?",
    answer: "You can request a Free Growth Audit through our contact form. Our dedicated experts will review your current online presence and provide a custom strategy tailored to your business goals."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="section faq-section">
      <div className="section-heading compact">
        <span className="eyebrow">Got Questions?</span>
        <h2>Frequently Asked Questions</h2>
        <p>Everything you need to know about partnering with BizzMaker for your growth.</p>
      </div>

      <div className="faq-container">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={`faq-item ${isOpen ? "open" : ""}`}
            >
              <button 
                className="faq-question" 
                onClick={() => toggleAccordion(index)}
                aria-expanded={isOpen}
              >
                <h3>{faq.question}</h3>
                <span className="faq-icon material-symbols-outlined">
                  {isOpen ? "remove" : "add"}
                </span>
              </button>
              <div 
                className="faq-answer-wrapper"
                style={{ 
                  maxHeight: isOpen ? "300px" : "0", 
                  opacity: isOpen ? 1 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease",
                  padding: isOpen ? "0 24px 24px 24px" : "0 24px 0 24px"
                }}
              >
                <p className="faq-answer">{faq.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
