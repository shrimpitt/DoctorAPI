import { useState } from "react";
import Navbar          from "../components/Navbar";
import Hero            from "../components/Hero";
import About           from "../components/About";
import Services        from "../components/Services";
import ProgramSection  from "../components/ProgramSection";
import Courses         from "../components/Courses";
import Blog            from "../components/Blog";
import Reviews         from "../components/Reviews";
import Contacts        from "../components/Contacts";
import Footer          from "../components/Footer";
import SearchSection   from "../components/SearchSection";

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState("home");

  return (
    <div className="app">
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main>
        <section id="home">    <Hero />     </section>
        <section id="about">   <About />    </section>
        <SearchSection />
        <section id="services"><Services /> </section>
        <ProgramSection />
        <section id="courses"> <Courses />  </section>
        <section id="blog">    <Blog />     </section>
        <section id="reviews"> <Reviews />  </section>
        <section id="contacts"><Contacts /> </section>
      </main>
      <Footer />
    </div>
  );
}
