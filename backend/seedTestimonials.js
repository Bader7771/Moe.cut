import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Testimonial from './models/Testimonial.js';

dotenv.config();

// Mongoose connection using the Atlas URI
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const fakeTestimonials = [
  {
    clientName: "Sarah Mitchell",
    review: "Working with the team completely transformed our online presence. The new website feels premium, performs beautifully, and our clients immediately noticed the difference.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  },
  {
    clientName: "David Chen",
    review: "Their approach to digital growth is unmatched. The branding identity they developed perfectly captures our company's ethos while positioning us as industry leaders.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  },
  {
    clientName: "Elena Rodriguez",
    review: "The video editing and editorial cuts they produced for our latest campaign were absolutely stunning. A level of polish you rarely find outside of massive studios.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  },
  {
    clientName: "Marcus Thorne",
    review: "From concept to deployment, their web development process was flawless. We saw a 40% increase in conversions within the first month of launching the new platform.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  },
  {
    clientName: "Julia Kastner",
    review: "They don't just build websites; they craft digital experiences. The subtle animations and typography choices elevated our brand far beyond our expectations.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  },
  {
    clientName: "Jameson Locke",
    review: "A true partner in creative direction. They understood our complex requirements and delivered a seamless, highly optimized landing page that converts beautifully.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  },
  {
    clientName: "Aisha Patel",
    review: "Incredible attention to detail. Every interaction, every transition feels meticulously planned. They are setting a new standard for creative agencies.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  },
  {
    clientName: "Thomas Wright",
    review: "Fast, responsive, and incredibly talented. They took our outdated legacy system and wrapped it in a modern, ultra-fast frontend that our users love.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  },
  {
    clientName: "Clara Vane",
    review: "The visual storytelling achieved through their timeline cuts is breathtaking. We've received endless compliments on the new aesthetic.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  },
  {
    clientName: "Robert Hsu",
    review: "Simply phenomenal work. They balanced aesthetic beauty with extreme performance optimization perfectly. The best investment our business has made this year.",
    image: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  }
];

const seedTestimonials = async () => {
  await connectDB();
  
  try {
    // Clear existing
    await Testimonial.deleteMany();
    console.log('Cleared existing testimonials');
    
    // Insert new
    await Testimonial.insertMany(fakeTestimonials);
    console.log('Successfully seeded 10 fake testimonials');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedTestimonials();
