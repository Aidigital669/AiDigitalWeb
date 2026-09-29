"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { useVisibility } from "../context/VisibilityContext";

const industryVisibilityMap = {
  "Real Estate": "portfolio_ind_realestate",
  "Education": "portfolio_ind_education",
  "Healthcare": "portfolio_ind_healthcare",
  "Finance": "portfolio_ind_finance",
  "Hotels and Resorts": "portfolio_ind_hospitality",
  "Hospitality": "portfolio_ind_hospitality",
  "Hospitality & Food": "portfolio_ind_hospitality",
  "Solar": "portfolio_ind_solar",
  "Interior Design": "portfolio_ind_interior",
  "Technology & Apps": "portfolio_ind_tech",
  "Tours & Travels": "portfolio_ind_travel",
  "Agriculture": "portfolio_ind_agriculture",
  "Sports": "portfolio_ind_sports",
  "Car Dealership": "portfolio_ind_cars",
  "Digital Marketing": "portfolio_ind_marketing",
  "Construction": "portfolio_ind_construction",
  "E-Commerce": "portfolio_ind_ecommerce",
};

const typeVisibilityMap = {
  website: "portfolio_type_websites",
  campaign: "portfolio_type_campaigns",
  video: "portfolio_type_aivideos",
  youtube: "portfolio_type_aivideos",
  image: "portfolio_type_creatives",
  reel: "portfolio_type_reels",
};
export const creativeGroups = [
  {
    industry: "Real Estate",
    description: "Websites, campaigns, AI property promotions, creative branding, and real estate reels.",
    images: [
      { src: "https://anvreealty.com/", thumbnail: "/uploads/Anv_reality.jpg", title: "ANV Realty Website", description: "Premium real estate and preleased properties website showcase. High-performing landing portal with optimized lead acquisition flows.", globalIndex: 2, type: "website" },
      { src: "/creative_content/RealState9.jpeg", title: "Avasa Grassland Plots", description: "Premium plotted development by Naiknavare Developers in Chakan, Pune.", globalIndex: 3, type: "image" },
      { src: "/creative_content/RealState10.jpeg", title: "Varistha Elite Residences", description: "Luxury 3 & 4 BHK homes with premium amenities and spacious residences.", globalIndex: 4, type: "image" },
      { src: "/creative_content/RealState11.jpeg", title: "Swapna Bhumi Badlapur", description: "Ready possession 1 & 2 BHK homes in a prime location in City Badlapur.", globalIndex: 5, type: "image" },
      { src: "/creative_content/RealState12.jpeg", title: "Premium Residences Hyderabad", description: "Iconic 3 & 4 BHK residences with 75% open spaces and world-class amenities.", globalIndex: 6, type: "image" },
      { src: "/creative_content/RealState13.jpeg", title: "Varistha Icon Luxury Homes", description: "Ready to move premium 3 & 4 BHK luxury homes with a 5-star clubhouse.", globalIndex: 7, type: "image" },
      { src: "/creative_content/RealState14.jpeg", title: "Swapna Bhumi Eid Promo", description: "Festive promotional campaign for 1 & 2 BHK ready to move homes in Badlapur.", globalIndex: 8, type: "image" },
      { src: "/creative_content/RealState1.jpeg", title: "Modern Home Showcase", description: "Clean, high-impact marketing design for modern residential listings.", globalIndex: 9, type: "image" },
      { src: "/creative_content/RealState2.jpeg", title: "Luxury Villa Feature", description: "Elegant flyer highlighting upscale property details and high-end aesthetics.", globalIndex: 10, type: "image" },
      { src: "/creative_content/RealState3.jpeg", title: "Contemporary Property Promo", description: "Visual branding creative showcasing structural elegance and open floor plans.", globalIndex: 11, type: "image" },
      { src: "/creative_content/RealState4.jpeg", title: "Premium Living Spaces", description: "Premium promotional content focusing on interior layout and design aesthetics.", globalIndex: 12, type: "image" },
      { src: "/creative_content/RealState5.jpeg", title: "Exclusive Villa Spotlight", description: "High-quality campaign creative built to capture attention for premium listings.", globalIndex: 13, type: "image" },
      { src: "/creative_content/RealState6.jpeg", title: "Modern Residential Flyer", description: "Polished design showcasing suburban homes with optimized call-to-action layout.", globalIndex: 14, type: "image" },
      { src: "/creative_content/RealState7.jpeg", title: "Luxury Estate Presentation", description: "Aesthetic real estate advertising banner highlighting premium property features.", globalIndex: 15, type: "image" },
      { src: "/creative_content/RealState8.jpeg", title: "Architectural Design Feature", description: "Campaign visual highlighting modern architecture and premium materials of top listings.", globalIndex: 16, type: "image" },
      { src: "/creative_content/RealState24.jpeg", title: "Topaz Towers Charholi Pune", description: "Premium 2 & 3 BHK spacious homes with unique butterfly concept and premium amenities.", globalIndex: 17, type: "image" },
      { src: "https://youtube.com/shorts/CGmclmt0ibU?si=1Axb2IWBm_WGI-LB", title: "AI Luxury Villa Walkthrough", description: "An AI-enhanced premium walkthrough video showcasing high-end interior spaces and architecture of a luxury villa.", globalIndex: 250, type: "youtube" },
      { src: "https://youtu.be/uxlAeIZCY1w", title: "Modern Apartment Tour", description: "An engaging real estate reel showing aesthetic decor, layout, and lighting in a modern urban apartment.", globalIndex: 251, type: "reel" },
      { src: "https://youtube.com/shorts/pogRO6aMOes?si=AM5Q5hTy50oTqGRa", title: "Real Estate AI Video", description: "A dynamic AI-generated short-form property promo video highlighting premium real estate spaces.", globalIndex: 252, type: "youtube" },
      { src: "https://youtube.com/shorts/APpxjSt5LLw?si=4r68FMnAWGrdhhxA", title: "Realistic AI Property Promo", description: "An immersive AI-assisted property promo video showcasing realistic real estate environments.", globalIndex: 253, type: "youtube" }
    ]
  },
  {
    industry: "Education",
    description: "Educational websites, admission campaigns, student-focused creatives, and promotional reels.",
    images: [
      { src: "/creative_content/Educational8.jpeg", title: "Ayush Vikas Foundation Admissions", description: "Admission open campaign for BNYS and BPT degrees with direct and online admission options.", globalIndex: 10, type: "image" },
      { src: "/creative_content/Educationcreative.jpeg", title: "Intraedu Smart Learning Panel", description: "Interactive AI-powered learning panel for schools and students.", globalIndex: 11, type: "image" },
      { src: "/creative_content/Education2creative.jpeg", title: "Adarsh Tuition Classes", description: "Foundation courses for 3rd to 12th standard State Board, CBSE, NEET & CET.", globalIndex: 12, type: "image" },
      { src: "/creative_content/Education3creative.jpeg", title: "Little Genius Playschool Admissions", description: "Admissions open for Play Group, Nursery, L.K.G. and U.K.G. programs.", globalIndex: 13, type: "image" },
      { src: "/creative_content/Education4creative.jpeg", title: "UPSC Decoded Foundation Courses", description: "Foundation program and competitive exam coaching for 11th & 12th students.", globalIndex: 14, type: "image" },
      { src: "/creative_content/Education5creative.jpeg", title: "KodeWitz Remote Internship", description: "100% remote IT internship programs with expert mentorship and live projects.", globalIndex: 15, type: "image" },
      { src: "/creative_content/Creative3.jpeg", title: "Global University Banner", description: "Promotional visual for academic programs and admissions.", globalIndex: 16, type: "image" },
      { src: "/creative_content/Creative4.jpeg", title: "Online Learning Poster", description: "E-learning platform advertisement graphic designed for campaigns.", globalIndex: 17, type: "image" },
      { src: "https://youtube.com/shorts/OjB222E1JFI?si=JQY90ZdxJdl7wLiY", title: "Educational AI Promo", description: "An interactive educational video highlighting learning concepts and academic excellence.", globalIndex: 198, type: "youtube" },
      { src: "https://youtube.com/shorts/CqpNv45IQBI", title: "UPSC DECODED", description: "An educational guide and course preview from UPSC DECODED, highlighting exam strategies and academic content.", globalIndex: 204, type: "youtube" },
      { src: "https://youtube.com/shorts/pd6kbpNsp5M", title: "Little Genius", description: "An engaging and fun promotional video highlighting early childhood learning, creative activities, and classes at Little Genius.", globalIndex: 207, type: "youtube" },
      { src: "https://youtube.com/shorts/3BNF1HUdHUo", title: "Paath Study", description: "An interactive educational overview and study session guide from Paath Study, designed to assist student learning and academic performance.", globalIndex: 209, type: "youtube" },
      { src: "/Campaign/EducationCampaign.jpeg", title: "Education Admission Campaign", description: "Targeted digital marketing campaign focusing on school and college admissions, enrollments, and academic awareness.", globalIndex: 300, type: "campaign" }
    ]
  },
  {
    industry: "Healthcare",
    description: "Healthcare websites, awareness campaigns, AI medical videos, and promotional content.",
    images: [
      { src: "/creative_content/HealthcareCreative.jpeg", title: "Reliv Pain Clinic & Wellness Centre", description: "Advanced pain management and holistic care for lasting relief.", globalIndex: 30, type: "image" },
      { src: "/creative_content/Healthcare2Creative.jpeg", title: "Dr. Rajguru Hair Care Clinic", description: "Expert trichologist consultation for hair fall, dandruff, and poor nutrition causes.", globalIndex: 31, type: "image" },
      { src: "/creative_content/healthcare3Creative.jpeg", title: "Apple Multispeciality Hospital", description: "Safe and affordable delivery packages with complete mother and baby care.", globalIndex: 32, type: "image" },
      { src: "/creative_content/Healthcare4.jpeg", title: "Ayurmor Business Opportunity", description: "Start your own herbal business with Zeyora and Ayurmor's range of products.", globalIndex: 33, type: "image" },
      { src: "/creative_content/Oldagehome.jpeg", title: "Tejomay Senior Citizen Care", description: "Comfortable living arrangements for seniors with healthy meals and meditation sessions.", globalIndex: 34, type: "image" },
      { src: "/creative_content/Oldagehome2.jpeg", title: "Tejomay Vrudhashram", description: "Respectful and caring senior citizen home with spiritual support and medical care.", globalIndex: 35, type: "image" },
      { src: "/creative_content/Oldagehome3.jpeg", title: "Tejomay Old Age Home", description: "Joyful living for seniors with clean, ventilated rooms and a supportive community.", globalIndex: 36, type: "image" },
      { src: "/creative_content/Opticalscreative.jpeg", title: "Shri Renuka Optical Glasses", description: "Stylish frames and advanced lenses with free eye check-up offers.", globalIndex: 37, type: "image" },
      { src: "/creative_content/Opticalscretive.jpeg", title: "Shri Renuka Optical Sunglasses", description: "Premium eyewear and sunglasses with special discount offers.", globalIndex: 38, type: "image" },
      { src: "/creative_content/Creative2.jpeg", title: "Healthcare Lead Campaign", description: "Digital marketing campaign designed to help doctors, clinics, and hospitals generate quality leads.", globalIndex: 39, type: "image" },
      { src: "/creative_content/Creative5.jpeg", title: "Healthcare Digital Marketing Campaign", description: "An ad creative and landing page concept designed for B2B lead generation targeting doctors and clinics.", globalIndex: 40, type: "image" },
      { src: "https://youtube.com/shorts/QIh7twZ3mV4", title: "Apple Multi Specialist Healthcare", description: "An AI-assisted promotional video highlighting hospital infrastructure, expert doctors, and advanced healthcare services at Apple Multi Specialist Healthcare.", globalIndex: 208, type: "youtube" },
      { src: "/Campaign/HealthcareCampaign.jpeg", title: "Healthcare Clinic Campaign", description: "A patient acquisition and awareness campaign built for doctors, specialty hospitals, and wellness clinics.", globalIndex: 304, type: "campaign" },
      { src: "https://youtu.be/AFilU3i5pTU", title: "Health Care", description: "Promotional reel highlighting advanced healthcare services and medical expertise.", globalIndex: 213, type: "reel" },
      { src: "https://youtube.com/shorts/3LK4K10ukvg", title: "Orthopedic Surgeon", description: "Promotional reel highlighting orthopedic surgical expertise.", globalIndex: 218, type: "reel" }
    ]
  },
  {
    industry: "Finance",
    description: "Finance dashboards, investment campaigns, branding creatives, and educational reels.",
    images: [
      { src: "/creative_content/Financecreative9.jpeg", title: "LIC Agent Recruitment", description: "Career opportunity campaign for LIC agents highlighting flexibility and unlimited commission.", globalIndex: 19, type: "image" },
      { src: "/creative_content/Financexreative.jpeg", title: "Loan Against Property", description: "Promotional banner for fast, hassle-free property loans with quick approval.", globalIndex: 20, type: "image" },
      { src: "/creative_content/Financecreative2.jpeg", title: "Cashcow Finserve Loan Solutions", description: "Personal, business, property, and car loans from a trusted financial partner.", globalIndex: 21, type: "image" },
      { src: "/creative_content/Financecreative3.jpeg", title: "Cashcow Finserve Partnership", description: "Trusted financial partner offering fast and secure loan solutions.", globalIndex: 22, type: "image" },
      { src: "/creative_content/Financecreative4.jpeg", title: "Taxclair ITR Services", description: "Fast, easy, and affordable Income Tax Return filing with expert support.", globalIndex: 23, type: "image" },
      { src: "/creative_content/Financecreative5.jpeg", title: "Taxclair ITR Billboard", description: "Outdoor advertising creative for affordable ITR filing services starting at ₹499.", globalIndex: 24, type: "image" },
      { src: "/creative_content/Financecreative6.jpeg", title: "ClaimAtoZ Insurance Support", description: "Expert guidance and strong case support for rejected or mis-sold insurance claims.", globalIndex: 25, type: "image" },
      { src: "/creative_content/Financecreative7.jpeg", title: "Shree HR PF & ESIC Services", description: "HR compliance services including PF & ESIC returns filing and salary management.", globalIndex: 26, type: "image" },
      { src: "/creative_content/Finance5.jpeg", title: "Demat Account Opening Campaign", description: "Expert demat account management, trade suggestions, and complete portfolio handling.", globalIndex: 27, type: "image" },
      { src: "/creative_content/ITRFinance.jpeg", title: "ITR Finance Creative", description: "Tax filing and ITR services promotional creative for digital campaigns.", globalIndex: 27, type: "image" },
      { src: "https://youtube.com/shorts/4K5K4USvQ-0", title: "Viyom Finance Services (Promo)", description: "A high-impact promotional video for Viyom Finance Services highlighting wealth growth, loans, and investment advisory.", globalIndex: 210, type: "youtube" },
      { src: "https://youtube.com/shorts/QheeYMmcdn4", title: "Quick Personal Loans", description: "An informative video guide on personal loans, instant approval options, and flexible repayment schemes.", globalIndex: 211, type: "youtube" },
      { src: "/Campaign/FinanceCampaign.jpeg", title: "Finance Advisory Campaign", description: "A lead generation and conversion-focused performance marketing campaign designed for financial service advisors.", globalIndex: 301, type: "campaign" },
      { src: "/creative_content/Educational9.jpeg", title: "Maruti Finance Home Loan", description: "Independence Day promotional creative for home loans with zero processing fees and up to 90% funding.", globalIndex: 112, type: "image" },
      { src: "/Campaign/FinanceCampaign2.jpeg", title: "Finance Wealth Campaign", description: "Strategic marketing campaign focusing on wealth management, investment trust, and retirement planning.", globalIndex: 302, type: "campaign" },
      { src: "https://youtu.be/HNj6t5O5jGc?si=8lClyV-k_gGSPPfi", title: "Siddhart Cars", description: "An engaging AI-assisted promotional video.", globalIndex: 255, type: "youtube" }
    ]
  },
  {
    industry: "Hotels and Resorts",
    description: "Premium hotel and resort promo videos, hospitality campaigns, and vacation stays.",
    images: [
      { src: "https://youtu.be/t1ybgC0M8Nc?si=dYy17iJ2qNWQt-o4", title: "Hilltop Karjat", description: "An engaging AI-assisted promotional video highlighting the scenic beauty and hospitality of Hilltop Karjat.", globalIndex: 258, type: "youtube" }
    ]
  },
  {
    industry: "Hospitality & Food",
    description: "Hotel booking platforms, restaurant campaigns, food brand creatives, and social media reels.",
    images: [
      { src: "/creative_content/HotelAndResort.jpeg", title: "Canal Touch Resort Getaway", description: "Family-friendly weekend getaway with canal-side rooms and nature views.", globalIndex: 50, type: "image" },
      { src: "/creative_content/HotelandResort2.jpeg", title: "Canal Touch Resort Rooms", description: "Experience nature's paradise with comfortable resort stays near Mumbai & Pune.", globalIndex: 51, type: "image" },
      { src: "/creative_content/HotelAndResorts3.jpeg", title: "Hayum Hotel Management", description: "Free hotel management training with accommodation, meals, and real 5-star experience.", globalIndex: 52, type: "image" },
      { src: "/creative_content/foodcreative1.jpeg", title: "Hayat Foods Frozen Meals", description: "High-quality frozen food supply for cafes, restaurants, and cloud kitchens.", globalIndex: 53, type: "image" },
      { src: "/creative_content/foodcreative2.jpeg", title: "Hayat Foods Special Meals", description: "Perfectly prepared quality frozen meals to make every bite lazeez.", globalIndex: 54, type: "image" },
      { src: "/creative_content/Creative6.jpeg", title: "Restaurant Brand Campaign", description: "High-quality lead generation and marketing flyer for dining brands.", globalIndex: 5, type: "image" },
      { src: "/creative_content/Creative9.jpeg", title: "Gourmet Bistro Banner", description: "Aesthetic culinary advertising graphic for restaurant promotions.", globalIndex: 8, type: "image" },
      { src: "https://youtube.com/shorts/eP3mbrEjEgA", title: "Hayat Food", description: "An appetizing preview showcasing Hayat Food's culinary items, gourmet dishes, and hospitality experiences.", globalIndex: 205, type: "youtube" },
      { src: "/Campaign/ResortsCampaign.jpeg", title: "Luxury Resort Booking Campaign", description: "High-impact advertising campaign optimized for luxury resort stays, hotel bookings, and dining promotions.", globalIndex: 305, type: "campaign" },
      { src: "https://youtube.com/shorts/yrA8PZJ17k4", title: "Hayum – Brand Promotional Video", description: "An engaging AI-assisted promotional reel for Hayum, highlighting brand story, product offerings, and audience connect.", globalIndex: 203, type: "youtube" },
      { src: "https://youtube.com/shorts/fzG-Itnt4ww", title: "Resort Reel", description: "Explore luxury resort experiences and hospitality excellence.", globalIndex: 214, type: "reel" }
    ]
  },
  {
    industry: "Solar",
    description: "Solar websites, green energy campaigns, AI solar videos, and promotional clean energy reels.",
    images: [
      { src: "/creative_content/Solar.jpeg", title: "Sun Astra Energy Solutions", description: "Avoid common mistakes with solar system sizing and get up to ₹78,000 subsidy.", globalIndex: 60, type: "image" },
      { src: "/creative_content/Solarcreative2.jpeg", title: "Sun Astra Solar Engineering", description: "Premium solar engineering with high ROI, fast installation, and free savings consultation.", globalIndex: 61, type: "image" },
      { src: "/creative_content/SolarCreative3.jpeg", title: "Sun Astra Engineering Solutions", description: "Turn sunlight into lifetime savings with premium components and expert installation.", globalIndex: 62, type: "image" },
      { src: "/creative_content/Solarcreative4.jpeg", title: "Sun Astra Zero Bill Solar", description: "Plug into sunlight and enjoy a zero electricity bill with premium solar systems.", globalIndex: 63, type: "image" },
      { src: "https://youtube.com/shorts/ZPqqln6JGNA", title: "BITAPLUS Solar", description: "An informative overview of BITAPLUS Solar's solar energy solutions, rooftop panel installations, and clean energy benefits.", globalIndex: 206, type: "youtube" },
      { src: "/Campaign/SolarCampaign.jpeg", title: "Solar Energy Lead Campaign", description: "Performance marketing campaign designed for commercial and residential solar installation leads.", globalIndex: 306, type: "campaign" },
      { src: "https://youtube.com/shorts/D8Bq6DyepVs", title: "Bitaplus Solar", description: "Clean energy solutions and solar panel installation showcase.", globalIndex: 219, type: "reel" }
    ]
  },
  {
    industry: "Interior Design",
    description: "Interior design studios, home décor campaigns, and premium living space creatives.",
    images: [
      { src: "/creative_content/Interiorcreative.jpeg", title: "Align Home Interior Nagpur", description: "Transform your dream home into reality with complete residential and commercial interior solutions.", globalIndex: 70, type: "image" },
      { src: "/creative_content/interior2creative.jpeg", title: "Honeywell Enterprises Interior", description: "Transforming spaces into experiences with modular furniture and turnkey solutions.", globalIndex: 71, type: "image" },
      { src: "/creative_content/Interior3creative.jpeg", title: "Honeywell Space Transformation", description: "Expert space planning, interior design, and modular furniture with 25+ years experience.", globalIndex: 72, type: "image" },
      { src: "/creative_content/Interior4creative.jpeg", title: "Arch Studio Interior Design", description: "Premium architecture and interior design services to craft spaces that reflect your lifestyle.", globalIndex: 73, type: "image" },
      { src: "https://youtube.com/shorts/jEOIOVnY_vI?si=8XAPXt0CxEe2YtTK", title: "Design Studio AI Video", description: "A stunning showcase of Aditya Modular Design Studio's premium modular furniture, custom interiors, and space transformation expertise.", globalIndex: 201, type: "youtube" },
      { src: "https://youtube.com/shorts/c5EmfsVswZk", title: "Interior Reel", description: "Aesthetic interior design concepts and space styling.", globalIndex: 215, type: "reel" },
      { src: "https://youtu.be/lzx89-Ds0UI?si=BYPUtEgbDHWWEiZk", title: "Livdecor Interior", description: "An immersive AI-assisted interior design promo video showcasing realistic modern space transformations.", globalIndex: 254, type: "youtube" }
    ]
  },
  {
    industry: "Technology & Apps",
    description: "Technology companies, SaaS platforms, application launches, and digital services campaigns.",
    images: [
      { src: "/creative_content/TechnologyCreative.jpeg", title: "LockYourIdea AI Video Solutions", description: "AI video creation and marketing dashboard to save your marketing budget.", globalIndex: 80, type: "image" },
      { src: "/creative_content/TechnologyCreative2.jpeg", title: "Electra Dealer Aata Chakki", description: "Premium domestic flour mill with a copper winding motor, low noise, and high performance.", globalIndex: 83, type: "image" },
      { src: "/creative_content/Applicationcreative.jpeg", title: "Macto AI Dashboard", description: "Smarter business dashboard powered by AI to launch, manage, and grow effortlessly.", globalIndex: 81, type: "image" },
      { src: "/creative_content/Applicationcreative2.jpeg", title: "Adly App All-in-One Partner", description: "All-in-one business app with auto WhatsApp, bulk messaging, and dynamic websites.", globalIndex: 82, type: "image" },
      { src: "https://youtube.com/shorts/dv9gLumeu4c", title: "Adly – Brand Promotional Video", description: "A high-impact AI-assisted promotional video for Adly, showcasing brand identity, product highlights, and digital marketing reach.", globalIndex: 202, type: "youtube" },
      { src: "https://youtu.be/f77Cbh2ol9Q?si=ntu4dSlpoxU87ctt", title: "Garments Software", description: "An engaging AI-assisted promotional video for technology and digital solutions.", globalIndex: 257, type: "youtube" }
    ]
  },
  {
    industry: "Tours & Travels",
    description: "Travel agencies, tourism campaigns, tour package creatives, and destination marketing.",
    images: [
      { src: "/creative_content/Tour&Travels3.jpeg", title: "Mountain Bliss Resort Girivan", description: "Your perfect escape in the lap of nature with a peaceful stay at Girivan, Mulshi.", globalIndex: 90, type: "image" },
      { src: "/creative_content/ToursAndTravels.jpeg", title: "Swamini Tours Somnath Dwarka Girnar", description: "Organized spiritual tour package for Somnath, Dwarka, and Girnar.", globalIndex: 91, type: "image" },
      { src: "/creative_content/ToursAnd2TRavels.jpeg", title: "Swamini Tours Spiritual Journey", description: "An unforgettable spiritual journey with comfortable travel, meals, and beautiful stays.", globalIndex: 92, type: "image" },
      { src: "https://youtube.com/shorts/IBu2_EvKAH4", title: "Tourism Reel", description: "Explore beautiful destinations and holiday packages.", globalIndex: 217, type: "reel" },
      { src: "https://youtube.com/shorts/i62UuswIIBU?si=aM-xl-eHdip6offu", title: "SWAMINI TOURS AI Promo", description: "Swamini Tours travel and tour package AI promotional video.", globalIndex: 221, type: "youtube" },
      { src: "https://youtube.com/shorts/oicsQmkp5D4", title: "Tours & Travels Reel", description: "Promotional reel for tourism and travel packages.", globalIndex: 220, type: "reel" }
    ]
  },
  {
    industry: "Agriculture",
    description: "Agricultural products, cattle nutrition, organic manure, crop protection, and farming solution creatives.",
    images: [
      { src: "/creative_content/AgricultureCreative.jpeg", title: "Suday Healthcare Cattle Nutrition", description: "Scientific cattle nutrition & milk production booster with Daymin Gold AD3 and Sudacal Gold AD3.", globalIndex: 110, type: "image" },
      { src: "/creative_content/AgricultureCreative1.jpeg", title: "Suday Healthcare Daymin Gold AD3", description: "Metho-Chelated mineral and vitamin powder supplement for cattle productivity, immunity, and health.", globalIndex: 111, type: "image" },
      { src: "/creative_content/AgricultureCreative2.jpeg", title: "Mack Agro Mack 007 Organic Manure", description: "Organic manure for greener fields, improved soil fertility, healthy roots, and higher crop yields.", globalIndex: 112, type: "image" },
      { src: "/creative_content/AgricultureCreative3.jpeg", title: "Mack Agro Farming Revolution", description: "High quality fish meal & oil cake organic fertilizer boosting soil fertility and accelerating crop growth.", globalIndex: 113, type: "image" },
      { src: "/creative_content/AgricultureCreative4.jpeg", title: "Agrifield Magic Flower Drop Control", description: "Advanced agricultural formula to prevent flower drop, enhance fruit setting, and boost crop productivity.", globalIndex: 114, type: "image" },
      { src: "/creative_content/AgricultureCreative5.jpeg", title: "Agrifield Magic Crop Protection", description: "Effective flower drop control and crop protection booster for maximum yield during flowering stage.", globalIndex: 115, type: "image" }
    ]
  },
  {
    industry: "Sports",
    description: "Sports brands, fitness campaigns, athletic event creatives, and sports marketing.",
    images: [
      { src: "/creative_content/Sportscreative1.jpeg", title: "Timeer's Badminton Academy", description: "Professional badminton coaching for all age groups with 20+ years of excellence.", globalIndex: 100, type: "image" },
      { src: "https://youtube.com/shorts/0BccV040p3o", title: "Sports Reel", description: "Dynamic sports and fitness promotional reel.", globalIndex: 216, type: "reel" }
    ]
  },
  {
    industry: "Car Dealership",
    description: "Promotional videos, marketing campaigns, and creative content for car dealerships.",
    images: [
      { src: "https://youtu.be/bvKjWoaAOQY?si=LnPMbHrhTanH2I_V", title: "Sharan360", description: "An engaging promotional video for Sharan360 car dealership, highlighting premium vehicles and automotive services.", globalIndex: 256, type: "youtube" }
    ]
  },
  {
    industry: "Digital Marketing",
    description: "AI-powered social media marketing, Google Ads, and performance-driven digital campaigns by Ai Digital.",
    images: [
      { src: "https://youtube.com/shorts/MHZQprGSsQ8?si=tKNvvbMnbiwHi2JD", title: "Ai Digital Performance Marketing", description: "Data-driven performance marketing and ROI focused digital campaigns.", globalIndex: 198, type: "youtube" },
      { src: "https://youtube.com/shorts/SzXb1FN8Q4E?si=n3blzkt9Z63PoimS", title: "Ai Digital Marketing Promo", description: "Performance-driven digital marketing and growth strategies by Ai Digital.", globalIndex: 199, type: "youtube" },
      { src: "https://youtube.com/shorts/VNMd9kBvsmg", title: "Ai Digital – Social Media Marketing", description: "Discover how Ai Digital drives measurable growth through social media marketing, Google Ads, and AI-powered digital strategies.", globalIndex: 200, type: "youtube" },
      { src: "https://youtube.com/shorts/kGqZ1WCFwXA", title: "Ai Digital – Affordable Video Services", description: "Get high-quality AI videos and social media creatives at affordable prices to boost your business reach.", globalIndex: 212, type: "youtube" }
    ]
  },
  {
    industry: "Construction",
    description: "All-in-one Construction ERP & Project Management software showcase, web portal, and local SEO campaign.",
    images: [
      { src: "https://www.hitoffice.co.in/", title: "Hitoffice Construction ERP", description: "Complete construction ERP and project management software website showcase. Feature-rich, optimized for lead generation and search engine visibility.", globalIndex: 101, type: "website" }
    ]
  },
  {
    industry: "E-Commerce",
    description: "High-converting e-commerce platforms, wellness product showcases, and retail marketing campaigns.",
    images: [
      { src: "/creative_content/Ecommerce-products.jpeg", title: "Pureplush Herbal Products", description: "E-commerce product showcase for pure and natural herbal skincare and hair care products.", globalIndex: 101, type: "image" },
      { src: "https://ayurmor.com/", thumbnail: "/uploads/Ayurmor.jpg", title: "Ayurmor Ayurvedic Wellness", description: "An SEO-friendly e-commerce platform for Ayurvedic health supplements and instant herbal soups, built with optimized product schemas and category pages.", globalIndex: 102, type: "website" },
      { src: "https://pureplush.in/", thumbnail: "/uploads/Pureplush.jpg", title: "Pureplush E-Commerce", description: "A premium e-commerce platform designed for high conversions, featuring a seamless shopping experience and elegant product showcases.", globalIndex: 103, type: "website" }
    ]
  }
];
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};
const CATEGORIES = [
  {
    id: "website",
    label: "WEBSITE & SEO",
    filterKey: "Website & SEO",
    description: "High-converting websites & SEO strategies",
    icon: "language",
    accent: "blue"
  },
  {
    id: "campaign",
    label: "CAMPAIGNS",
    filterKey: "Campaigns",
    description: "Targeted ad campaigns that drive real leads",
    icon: "campaign",
    accent: "orange"
  },
  {
    id: "video",
    label: "AI VIDEOS",
    filterKey: "AI Videos",
    description: "AI-powered promo videos & property tours",
    icon: "movie",
    accent: "blue"
  },
  {
    id: "image",
    label: "CREATIVE CONTENT",
    filterKey: "Creative Content",
    description: "Stunning visuals & brand design assets",
    icon: "palette",
    accent: "orange"
  },
  {
    id: "reel",
    label: "REELS",
    filterKey: "Reels",
    description: "Engaging short-form reels for social media",
    icon: "smart_display",
    accent: "blue"
  }
];
export default function CreativeGrid({ activeFilter = "All", setActiveFilter, searchQuery = "", setSearchQuery, onlyShowOtherCreative = false }) {
  const { isVisible } = useVisibility();
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const scrollContainers = useRef({});
  const [creativeGroupsState, setCreativeGroupsState] = useState(creativeGroups);
  const [videoErrors, setVideoErrors] = useState({});

  const visibleCategories = useMemo(() => {
    return CATEGORIES.filter(cat => {
      const visibilityKey = typeVisibilityMap[cat.id];
      return !visibilityKey || isVisible(visibilityKey);
    });
  }, [isVisible]);
  const getMediaType = (type, src, category) => {
    if (category === "image" || category === "video" || category === "reel" || category === "website" || category === "campaign") {
      return category;
    }
    let resolvedType = type;
    if (!resolvedType && src) {
      const url = src.toLowerCase();
      if (url.includes("youtube.com") || url.includes("youtu.be")) resolvedType = "youtube";
      else if (url.includes("instagram.com/reel") || url.includes("instagram.com/p")) resolvedType = "instagram";
      else if (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg") || url.endsWith(".mov")) resolvedType = "video";
      else if (url.startsWith("http")) resolvedType = "website";
      else if (url.includes("/campaign/")) resolvedType = "campaign";
      else resolvedType = "image";
    }
    if (resolvedType === "youtube" || resolvedType === "iframe" || resolvedType === "video") return "video";
    if (resolvedType === "instagram" || resolvedType === "reel") return "reel";
    if (resolvedType === "website") return "website";
    if (resolvedType === "campaign") return "campaign";
    return "image";
  };
  const getCategoryProject = (group, catId) => {
    // 1. Find direct match in group.images
    const imgProj = group.images.find(img => {
      const type = getMediaType(img.type, img.src, img.category);
      return type === catId;
    });
    if (imgProj) return imgProj;
    // 2. Fallback to hardcoded industry mapping
    const industryData = {
      "Real Estate": {
        website: "ANV Realty Website",
        campaign: "Real Estate Lead Campaign",
        video: "AI Property Promo",
        image: "Real Estate Brand Creative",
        reel: "Real Estate Instagram Reel"
      },
      "Education": {
        website: "School Website",
        campaign: "Admission Campaign",
        video: "Educational AI Video",
        image: "Education Creative",
        reel: "Student Awareness Reel"
      },
      "Healthcare": {
        website: "Hospital Website",
        campaign: "Healthcare Campaign",
        video: "AI Medical Promo",
        image: "Healthcare Branding Creative",
        reel: "Health Care"
      },
      "Finance": {
        website: "Finance Dashboard",
        campaign: "Investment Campaign",
        video: "RR Capital Promo",
        image: "Finance Social Creative",
        reel: "Finance Awareness Reel"
      },
      "Hospitality & Food": {
        website: "Hotel Booking Website",
        campaign: "Restaurant Campaign",
        video: "AI Hotel Promo",
        image: "Hotel & Resort Creative",
        reel: "Hospitality Reel"
      },
      "Solar": {
        website: "Solar Landing Page",
        campaign: "Green Energy Campaign",
        video: "KwikM Solar Promo",
        image: "Solar Energy Creative",
        reel: "Bitaplus Solar"
      },
      "Interior Design": {
        website: "Interior Design Portal",
        campaign: "Modular Home Campaign",
        video: "Aditya Modular Design Studio",
        image: "Interior Design Creative",
        reel: "Interior Reel"
      },
      "Technology & Apps": {
        website: "SaaS Launch Page",
        campaign: "App Lead Campaign",
        video: "Adly – Brand Promotional Video",
        image: "Technology Creative",
        reel: "Technology Explainer Reel"
      },
      "Tours & Travels": {
        website: "Travel Booking Site",
        campaign: "Tours Lead Campaign",
        video: "Tourism Reel",
        image: "Tours & Travels Creative",
        reel: "Tours & Travels Reel"
      },
      "Sports": {
        website: "Sports Platform",
        campaign: "Fitness Lead Campaign",
        video: "Dynamic Fitness Promo",
        image: "Sports Creative",
        reel: "Sports Reel"
      },
      "Agriculture": {
        website: "Agricultural Landing Page",
        campaign: "Sustainable Farm Campaign",
        video: "Mack Agro Promo",
        image: "Suday Healthcare Cattle Nutrition",
        reel: "Agriculture Promotion Reel"
      },
      "Other Creative": {
        website: "Custom Web Integration",
        campaign: "Foundation Brand Campaign",
        video: "Ayush Vikas Foundation Reel",
        image: "Other Brand Creative",
        reel: "Ayush Vikas Foundation Reel"
      },
      "Digital Marketing": {
        website: "Affordable Growth Site",
        campaign: "AI Performance Campaign",
        video: "Ai Digital – Social Media Marketing",
        image: "Ai Digital – Affordable Video Services",
        reel: "Ai Digital – Affordable Video Services"
      },
      "Construction": {
        website: "Hitoffice Construction ERP",
        campaign: "Construction ERP Campaign",
        video: "Construction ERP AI Promo",
        image: "Construction Branding Creative",
        reel: "Construction Project Reel"
      },
      "E-Commerce": {
        website: "Ayurmor Wellness Store",
        campaign: "E-Commerce Growth Campaign",
        video: "E-Commerce AI Promo",
        image: "E-Commerce Branding Creative",
        reel: "E-Commerce Product Reel"
      }
    };
    const indName = group.industry;
    const mappedObj = industryData[indName];
    if (mappedObj && mappedObj[catId]) {
      return {
        title: mappedObj[catId],
        src: "",
        type: catId,
        isPlaceholder: true
      };
    }
    const defaults = {
      website: "Website Design",
      campaign: "Performance Marketing",
      video: "AI Promo Video",
      image: "Creative Content",
      reel: "Instagram Reel"
    };
    return {
      title: `${indName} ${defaults[catId]}`,
      src: "",
      type: catId,
      isPlaceholder: true
    };
  };
  const getPlayerType = (src, type) => {
    if (type === "website") return "website";
    if (type === "campaign") return "image";
    if (!src) return "image";
    const url = src.toLowerCase();
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("instagram.com/reel") || url.includes("instagram.com/p")) return "instagram";
    if (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg") || url.endsWith(".mov")) return "video";
    if (url.startsWith("http") && !url.match(/\.(jpeg|jpg|gif|png|webp|svg)/)) return "website";
    return "image";
  };
  const getYoutubeThumbnail = (src) => {
    let videoId = "";
    if (src.includes("youtu.be/")) {
      videoId = src.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0];
    } else if (src.includes("youtube.com/shorts/")) {
      videoId = src.split("youtube.com/shorts/")[1]?.split("?")[0]?.split("&")[0];
    } else if (src.includes("v=")) {
      videoId = src.split("v=")[1]?.split("&")[0];
    } else if (src.includes("embed/")) {
      videoId = src.split("embed/")[1]?.split("?")[0];
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  };
  const getThumbnail = (src, type) => {
    const playerType = getPlayerType(src, type);
    if (playerType === "youtube") {
      const ytThumb = getYoutubeThumbnail(src);
      if (ytThumb) return ytThumb;
    }
    if (playerType === "instagram") {
      return "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60";
    }
    if (playerType === "iframe") {
      return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60";
    }
    if (playerType === "website") {
      if (src && (src.startsWith("http://") || src.startsWith("https://"))) {
        return `https://image.thum.io/get/${src}`;
      }
      return src;
    }
    return src;
  };
  const getEmbedUrl = (src) => {
    if (!src) return "";
    if (src.includes("youtube.com") || src.includes("youtu.be")) {
      let videoId = "";
      if (src.includes("youtu.be/")) {
        videoId = src.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0];
      } else if (src.includes("youtube.com/shorts/")) {
        videoId = src.split("youtube.com/shorts/")[1]?.split("?")[0]?.split("&")[0];
      } else if (src.includes("v=")) {
        videoId = src.split("v=")[1]?.split("&")[0];
      } else if (src.includes("embed/")) {
        videoId = src.split("embed/")[1]?.split("?")[0];
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : src;
    }
    if (src.includes("instagram.com/reel") || src.includes("instagram.com/p")) {
      const cleanUrl = src.split("?")[0].replace(/\/+$/, "");
      return `${cleanUrl}/embed/`;
    }
    return src;
  };
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    // Round-robin interleave: pick 1 website, 1 creative, 1 AI video, 1 reel per round
    const interleaveByType = (images) => {
      const sortByIndex = (arr) => [...arr].sort((a, b) => {
        const iA = a.globalIndex !== undefined && a.globalIndex !== null && a.globalIndex !== "" ? Number(a.globalIndex) : 999999;
        const iB = b.globalIndex !== undefined && b.globalIndex !== null && b.globalIndex !== "" ? Number(b.globalIndex) : 999999;
        return iA - iB;
      });
      const websites  = sortByIndex(images.filter(img => getMediaType(img.type, img.src, img.category) === "website"));
      const creatives = sortByIndex(images.filter(img => getMediaType(img.type, img.src, img.category) === "image" || getMediaType(img.type, img.src, img.category) === "campaign"));
      const videos    = sortByIndex(images.filter(img => getMediaType(img.type, img.src, img.category) === "video"));
      const reels     = sortByIndex(images.filter(img => getMediaType(img.type, img.src, img.category) === "reel"));
      const maxRounds = Math.max(websites.length, creatives.length, videos.length, reels.length);
      const result = [];
      for (let i = 0; i < maxRounds; i++) {
        if (websites[i])  result.push(websites[i]);
        if (creatives[i]) result.push(creatives[i]);
        if (videos[i])    result.push(videos[i]);
        if (reels[i])     result.push(reels[i]);
      }
      return result;
    };
    return creativeGroupsState.filter(group => {
      if (onlyShowOtherCreative) {
        if (group.industry !== "Car Dealership") return false;
      } else {
        if (group.industry === "Car Dealership") return false;
      }
      const indKey = industryVisibilityMap[group.industry];
      if (indKey && !isVisible(indKey)) return false;
      return true;
    }).map(group => {
      const filteredImages = group.images.filter(img => {
        const type = getMediaType(img.type, img.src, img.category);
        const typeKey = typeVisibilityMap[type];
        if (typeKey && !isVisible(typeKey)) return false;

        let matchesCategory = true;
        if (activeFilter === "Creative Content") matchesCategory = type === "image";
        else if (activeFilter === "AI Videos") matchesCategory = type === "video";
        else if (activeFilter === "Reels") matchesCategory = type === "reel";
        else if (activeFilter === "Website & SEO") matchesCategory = type === "website";
        else if (activeFilter === "Campaigns") matchesCategory = type === "campaign";
        if (!matchesCategory) return false;
        if (!q) return true;
        const titleMatch = img.title?.toLowerCase().includes(q);
        const descMatch = img.description?.toLowerCase().includes(q);
        const typeMatch = img.type?.toLowerCase().includes(q) || type.toLowerCase().includes(q);
        const industryMatch = group.industry?.toLowerCase().includes(q);
        return titleMatch || descMatch || typeMatch || industryMatch;
      });
      let finalImages;
      if (activeFilter === "All" && !q) {
        // Interleave: 1 website → 1 creative → 1 AI video → 1 reel per slide
        finalImages = interleaveByType(filteredImages);
      } else {
        // Other filters or when search query is active: sort by globalIndex only
        finalImages = [...filteredImages].sort((a, b) => {
          const indexA = a.globalIndex !== undefined && a.globalIndex !== null && a.globalIndex !== "" ? Number(a.globalIndex) : 999999;
          const indexB = b.globalIndex !== undefined && b.globalIndex !== null && b.globalIndex !== "" ? Number(b.globalIndex) : 999999;
          return indexA - indexB;
        });
      }
      return {
        ...group,
        images: finalImages
      };
    }).filter(group => {
      if (activeFilter === "All" && !q) {
        return visibleCategories.length > 0;
      }
      return group.images.length > 0;
    });
  }, [activeFilter, searchQuery, creativeGroupsState, onlyShowOtherCreative, isVisible, visibleCategories]);
  const visibleItems = useMemo(() => {
    return filteredGroups.flatMap(group => group.images);
  }, [filteredGroups]);
  const handleScroll = (industry, direction) => {
    const container = scrollContainers.current[industry];
    if (container) {
      const scrollAmount = container.clientWidth;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };
  useEffect(() => {
    if (selectedImageIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedImageIndex(null);
      } else if (e.key === "ArrowRight") {
        setSelectedImageIndex((current) => (current + 1) % visibleItems.length);
      } else if (e.key === "ArrowLeft") {
        setSelectedImageIndex((current) => (current - 1 + visibleItems.length) % visibleItems.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, visibleItems]);
  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedImageIndex]);
  const activeImage = selectedImageIndex !== null ? visibleItems[selectedImageIndex] : null;
  if (filteredGroups.length === 0) {
    return (
      <div className="search-no-results">
        <span className="material-symbols-outlined no-results-icon" aria-hidden="true">
          search_off
        </span>
        <h4>No projects found</h4>
        <p>
          We couldn&apos;t find any projects matching &quot;<strong>{searchQuery}</strong>&quot;.
        </p>
        <button
          type="button"
          onClick={() => {
            if (setSearchQuery) setSearchQuery("");
            if (setActiveFilter) setActiveFilter("All");
          }}
        >
          Clear Search Filter
        </button>
      </div>
    );
  }
  return (
    <>
      {filteredGroups.map((group) => (
        <article className="industry-section" key={group.industry} style={{ marginTop: "24px" }}>
          <div className="industry-copy">
            <span className="industry-label">Industry</span>
            <h3>{group.industry}</h3>
            <p>{group.description}</p>
          </div>
          {activeFilter === "All" && !searchQuery.trim() ? (
            <div className="industry-boxes-grid">
              {visibleCategories.map((cat, idx) => {
                const proj = getCategoryProject(group, cat.id);
                const handleClick = (e) => {
                  if (setActiveFilter) {
                    setActiveFilter(cat.filterKey);
                  }
                };
                return (
                  <div
                    key={cat.id}
                    className="featured-project-card"
                    style={{ cursor: "pointer" }}
                    onClick={handleClick}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {cat.icon}
                    </span>
                    <strong>{cat.filterKey}</strong>
                    <small>{cat.description}</small>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Grid + side arrows wrapper */
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "0", width: "100%", minWidth: 0 }}>
              {/* Left arrow */}
              {group.images.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleScroll(group.industry, "left")}
                  aria-label="Scroll left"
                  style={{
                    flexShrink: 0,
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    boxShadow: "0 2px 8px rgba(15,23,42,0.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#2684b9",
                    transition: "background 0.2s, box-shadow 0.2s",
                    zIndex: 2,
                    marginRight: "8px",
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "#f0f9ff"}
                  onMouseOut={e => e.currentTarget.style.background = "#ffffff"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>arrow_back</span>
                </button>
              )}
              {/* Scrollable card grid */}
              <div
                className="creative-grid"
                ref={(el) => {
                  if (el) scrollContainers.current[group.industry] = el;
                }}
                style={{ flex: 1, minWidth: 0 }}
              >
                {chunkArray(group.images, 2).map((slideImages, slideIdx) => (
                  <div className="creative-slide" key={slideIdx}>
                    {slideImages.map((img) => {
                      const imageIndex = visibleItems.findIndex((item) => item.src === img.src);
                      return (
                        <div
                          className="creative-card"
                          key={img.src}
                          onClick={() => setSelectedImageIndex(imageIndex)}
                          tabIndex={0}
                          role="button"
                          aria-label={`View ${img.title} in full screen`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedImageIndex(imageIndex);
                            }
                          }}
                        >
                          <div className="creative-img-wrapper" style={{ position: "relative", width: "100%", height: "200px" }}>
                            {(() => {
                              const playerType = getPlayerType(img.src, img.type);
                              const isExternalUrl = img.src && (img.src.startsWith("http://") || img.src.startsWith("https://"));
                              if (playerType === "video") {
                                if (videoErrors[img.src]) {
                                  return (
                                    <div
                                      className="creative-img-fallback"
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "linear-gradient(135deg, #1f2937, #111827)",
                                        color: "#9ca3af",
                                        padding: "16px",
                                        textAlign: "center"
                                      }}
                                    >
                                      <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "#e56030", marginBottom: "8px" }}>
                                        videocam_off
                                      </span>
                                      <span style={{ fontSize: "11px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        Video Unavailable
                                      </span>
                                    </div>
                                  );
                                }
                                return (
                                  <video
                                    src={img.src}
                                    className="creative-img"
                                    style={{ objectFit: "cover", width: "100%", height: "100%", display: "block" }}
                                    muted
                                    playsInline
                                    loop
                                    onMouseOver={(e) => e.target.play()}
                                    onMouseOut={(e) => e.target.pause()}
                                    onError={() => {
                                      setVideoErrors((prev) => ({ ...prev, [img.src]: true }));
                                    }}
                                  />
                                );
                              }
                              if (playerType === "website") {
                                const thumb = img.thumbnail || (isExternalUrl
                                  ? `https://image.thum.io/get/${img.src}`
                                  : img.src);
                                return (
                                  <img
                                    src={thumb}
                                    alt={img.title}
                                    className="creative-img"
                                    style={{ objectFit: "cover", width: "100%", height: "100%", display: "block" }}
                                    loading="lazy"
                                  />
                                );
                              }
                              const thumb = getThumbnail(img.src, img.type) || "/placeholder.jpg";
                              return (
                                <img
                                  src={thumb}
                                  alt={img.title}
                                  className="creative-img"
                                  style={{ objectFit: "cover", width: "100%", height: "100%", display: "block" }}
                                  loading="lazy"
                                />
                              );
                            })()}
                            <div className="creative-overlay">
                              <div className="creative-overlay-icon">
                                <span className="material-symbols-outlined">
                                  {(() => {
                                    const playerType = getPlayerType(img.src, img.type);
                                    return (playerType === "video" || playerType === "youtube" || playerType === "instagram" || playerType === "reel")
                                      ? "play_circle"
                                      : "zoom_in";
                                  })()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="creative-card-info" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                            <div>
                              <h4>{img.title}</h4>
                              <p>{img.description}</p>
                            </div>
                            {getPlayerType(img.src, img.type) === "website" && img.src && (img.src.startsWith("http://") || img.src.startsWith("https://")) && (
                              <a
                                href={img.src}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="open-website-btn"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "6px",
                                  marginTop: "12px",
                                  backgroundColor: "#d63e13",
                                  color: "#fff",
                                  padding: "8px 16px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  textDecoration: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  width: "fit-content",
                                  transition: "background-color 0.2s ease"
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>open_in_new</span>
                                Visit Website
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              {/* Right arrow */}
              {group.images.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleScroll(group.industry, "right")}
                  aria-label="Scroll right"
                  style={{
                    flexShrink: 0,
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    boxShadow: "0 2px 8px rgba(15,23,42,0.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#2684b9",
                    transition: "background 0.2s, box-shadow 0.2s",
                    zIndex: 2,
                    marginLeft: "8px",
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "#f0f9ff"}
                  onMouseOut={e => e.currentTarget.style.background = "#ffffff"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>arrow_forward</span>
                </button>
              )}
            </div>
          )}
        </article>
      ))}
      {activeImage && (
        <div
          className="creative-lightbox"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedImageIndex(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
        >
          <div className="lightbox-content-container">
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setSelectedImageIndex(null)}
              aria-label="Close lightbox"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <button
              type="button"
              className="lightbox-nav prev"
              onClick={() => setSelectedImageIndex((current) => (current - 1 + visibleItems.length) % visibleItems.length)}
              aria-label="Previous image"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="lightbox-image-wrapper" style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
              {(() => {
                const playerType = getPlayerType(activeImage.src, activeImage.type);
                if (playerType === "video") {
                  if (videoErrors[activeImage.src]) {
                    return (
                      <div
                        style={{
                          width: "80vw",
                          height: "50vh",
                          maxWidth: "600px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "linear-gradient(135deg, #1f2937, #111827)",
                          color: "#9ca3af",
                          borderRadius: "12px",
                          border: "1px solid #374151",
                          textAlign: "center",
                          padding: "24px"
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "#e56030", marginBottom: "16px" }}>
                          videocam_off
                        </span>
                        <h4 style={{ color: "#fff", marginBottom: "8px" }}>Video file not found locally</h4>
                        <p style={{ fontSize: "14px", maxWidth: "400px", margin: "0 auto", color: "#9ca3af" }}>
                          The video file <strong>{activeImage.src.split('/').pop()}</strong> is ignored in Git and needs to be placed under <code>public/ai_videos/</code>.
                        </p>
                      </div>
                    );
                  }
                  return (
                    <video
                      src={activeImage.src}
                      controls
                      autoPlay
                      className="lightbox-image"
                      style={{ maxHeight: "80vh", maxWidth: "100%", borderRadius: "8px", objectFit: "contain" }}
                      onError={() => {
                        setVideoErrors((prev) => ({ ...prev, [activeImage.src]: true }));
                      }}
                    />
                  );
                } else if (playerType === "youtube" || playerType === "instagram" || playerType === "iframe") {
                  const embedUrl = getEmbedUrl(activeImage.src);
                  return (
                    <iframe
                      src={embedUrl}
                      title={activeImage.title}
                      className="lightbox-image"
                      style={{
                        width: "80vw",
                        height: "70vh",
                        maxWidth: "960px",
                        maxHeight: "600px",
                        border: "none",
                        borderRadius: "12px",
                        backgroundColor: "#000"
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                } else if (playerType === "website") {
                  const imageSrc = activeImage.thumbnail || (activeImage.src && (activeImage.src.startsWith("http://") || activeImage.src.startsWith("https://"))
                    ? `https://image.thum.io/get/${activeImage.src}`
                    : activeImage.src);
                  return (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                      <img
                        src={imageSrc}
                        alt={activeImage.title}
                        className="lightbox-image"
                        style={{ maxHeight: "70vh", maxWidth: "100%", borderRadius: "8px", objectFit: "contain" }}
                      />
                      <a
                        href={activeImage.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          backgroundColor: "#d63e13",
                          color: "#fff",
                          padding: "12px 24px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: "600",
                          textDecoration: "none",
                          transition: "background-color 0.2s ease"
                        }}
                      >
                        <span className="material-symbols-outlined">open_in_new</span>
                        Open Website Link
                      </a>
                    </div>
                  );
                } else {
                  return (
                    <img
                      src={activeImage.src}
                      alt={activeImage.title}
                      className="lightbox-image"
                    />
                  );
                }
              })()}
            </div>
            <button
              type="button"
              className="lightbox-nav next"
              onClick={() => setSelectedImageIndex((current) => (current + 1) % visibleItems.length)}
              aria-label="Next image"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            <div className="lightbox-caption">
              <h3 id="lightbox-title">{activeImage.title}</h3>
              <p>{activeImage.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
