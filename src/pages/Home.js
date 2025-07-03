import Header from '../components/Header/Header';
import '../assets/styles/home.css';
import facialMassage from '../assets/images/facial_massage.png';

function Home() {
  return (
    <div className="home">
      <Header />
      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="hero-image">
              <img src={facialMassage} alt="Facial Massage" />
            </div>
            <div className="hero-text">
              <h1>Professional Beauty Services</h1>
              <p>
                With over 20 years of experience as a qualified beauty therapist and nail technician, 
                I'm here to bring you the ultimate self-care experience. From flawless nails to relaxing 
                treatments that will make you feel confident in your own skin.
              </p>
              <p>
                Whether you're preparing for a special occasion or just need some time to unwind, 
                I offer a range of services tailored to your needs. My goal is to help you look 
                and feel your best, so you can step out into the world with confidence.
              </p>
              <p>Book your appointment today and let me take care of you!</p>
              <button className="cta-button">Book Now</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;