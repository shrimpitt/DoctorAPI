import Navbar from "../components/Navbar";
import MediaSection from "../components/MediaSection";
import "./CoursesPage.css";

export default function CoursesPage() {
  return (
    <>
      <Navbar />
      <div className="media-page">
        <MediaSection showHero={true} />
        <div className="media-footer-space" />
      </div>
    </>
  );
}
