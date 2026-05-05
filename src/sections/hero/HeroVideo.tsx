import heroVideo from "../../assets/videos/video_hero.mp4"

const HeroVideo = () => {
  return (
    <video
      className="hero-video"
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"
      poster=""
    >
      <source src={heroVideo} type="video/mp4" />
    </video>
  )
}

export default HeroVideo