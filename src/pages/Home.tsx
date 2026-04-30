import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import NewsBar from '../components/home/NewsBar';
import SocialImpact from '../components/home/SocialImpact';
import InstagramFeed from '../components/home/InstagramFeed';
import TrophiesGallery from '../components/home/TrophiesGallery';
import Footer from '../components/layout/Footer';

export default function Home() {
  return (
    <>
      <Hero />
      <NewsBar />
      <SocialImpact />
      <InstagramFeed />
      <TrophiesGallery />
    </>
  );
}
