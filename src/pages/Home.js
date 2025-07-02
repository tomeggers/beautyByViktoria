import Header from '../components/Header/Header';
import '../assets/styles/main.css'; // Assuming you have a CSS file for styling

function Home() {
  return (
    <div className="home">
      <Header />
      <main>
        <section className="hero">
          <h1>Professional Beauty Services</h1>
          <p>Enhance your natural beauty with our premium treatments</p>
        </section>
      </main>
    </div>
  );
}

export default Home;