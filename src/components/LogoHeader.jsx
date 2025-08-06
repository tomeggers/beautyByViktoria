import '../assets/styles/header.css';

export default function LogoHeader() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-wrapper">
          <img 
            src="/images/reducedPics/navbar_logo_transparent.webp" 
            alt="Beauty by Viktoria" 
            className="header-logo"
          />
        </div>
      </div>
    </header>
  );
}
