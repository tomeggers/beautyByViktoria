import '../assets/styles/home.css';
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaFacebook } from 'react-icons/fa';
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

function Home() {
  const navigate = useNavigate();
  const [titleNumber, setTitleNumber] = useState(0);
  
  const titles = useMemo(
    () => ["beautiful", "confident", "radiant", "glowing", "stunning"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="home">
      <main>
        {/* Modern Animated Hero Section */}
        <section className="modern-hero">
          <div className="container">
            <div className="hero-content-modern">
              <div className="hero-text-modern">
                <h1 className="hero-title">
                  <span className="text-primary"><span className="text-primary">Transform into someone who feels</span>
                  </span>
                  <div className="animated-word-container">
                    {titles.map((title, index) => (
                      <motion.span
                        key={index}
                        className="animated-word"
                        initial={{ opacity: 0, y: "-100" }}
                        transition={{ type: "spring", stiffness: 50 }}
                        animate={
                          titleNumber === index
                            ? {
                                y: 0,
                                opacity: 1,
                              }
                            : {
                                y: titleNumber > index ? -150 : 150,
                                opacity: 0,
                              }
                        }
                      >
                        {title}
                      </motion.span>
                    ))}
                  </div>
                </h1>

                <p className="hero-description">
                  With over 20 years of experience as a qualified beauty therapist, nail technician and cosmetic tattoo artist, 
                  I'm here to bring you the ultimate self-care experience. From flawless nails to relaxing 
                  treatments that will make you feel confident in your own skin.
                </p>
              </div>
              
              <div className="hero-actions">
                <button 
                  className="cta-button-modern" 
                  onClick={() => navigate('/gallery')}
                >
                  View My Work
                </button>
                <button 
                  className="cta-button-modern" 
                  onClick={() => navigate('/book')}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* About Me Section */}
        <section className="hero about-me">
          <div className="about-me">
            <div className="hero-image">
              <img src="/images/reducedPics/viktoria-headshot.webp" alt="Viktoria's Headshot" />
            </div>
            <div className="hero-text">
              <h1>Meet Viktoria</h1>
              <p>I'm a proud mother of three young adults and have been happily married to my husband, Jamie, since 1999. Originally from Southland, I've called Nelson home since I was 16 and I truly can't imagine living anywhere else.</p>
              <p>I adore my two golden retrievers who are never far from my side and cherish quiet moments with a good book, whether paired with a morning coffee or a cozy evening glass of wine. I love walking the tracks on the Richmond hills, traveling and spending quality time with family and friends.</p>
              <p>Becoming a beauty therapist was a natural choice for me because I genuinely love making people feel good about themselves. A beauty treatment is more than a service, it's a moment of calm in a busy life. I feel incredibly privileged to be part of that experience.</p>
              <p>There's something rewarding about pampering others and helping them relax, unwind, and walk away feeling more confident and cared for. I'm passionate about helping women feel beautiful, not just on the outside, but within as well.</p>
              <p>I pride myself on being a good intuitive listener. My nurturing nature allows me to build meaningful connections with my clients.</p>
            </div>
          </div>
        </section>

        {/* Social Media Links */}
        <section className="social-media">
          <h2>Connect With Me</h2>
            <div className="social-icons">
              <a href="https://www.instagram.com/beauty_byviktoria/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram className="social-icon" size={32} />
                <p>Beauty by Viktoria Instagram</p>
              </a>
             <a href="https://www.facebook.com/Viktoriahouseofbeauty" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebook className="social-icon" size={32} />
                <p>Beauty by Viktoria Facebook</p>
              </a>
            </div>
        </section>
      </main>
    </div>
  );
}

export default Home;