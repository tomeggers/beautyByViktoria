import '../assets/styles/home.css';
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaFacebook } from 'react-icons/fa';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-image">
              <img src="/images/reducedPics/Nails-home.webp" alt="Nails" />
            </div>
            <div className="hero-text">
              <p>
                With over 20 years of experience as a qualified beauty therapist, nail technician and cosmetic tattoo artist, 
                I'm here to bring you the ultimate self-care experience. From flawless nails to relaxing 
                treatments that will make you feel confident in your own skin.
              </p>
              <p>
                Whether you're preparing for a special occasion or just need some time to unwind, 
                I offer a range of services tailored to your needs. My goal is to help you look 
                and feel your best, so you can step out into the world with confidence.
              </p>
              <p>Book your appointment today and let me take care of you!</p>
               <button 
                className="cta-button" 
                onClick={() => navigate('/book')}
                aria-label="Book an appointment"
              >
                Book Now
              </button>
            </div>
          </div>
        </section>

        {/* About Me Section */}
        <section className="hero about-me">
          <div className="hero-content">
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