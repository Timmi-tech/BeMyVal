import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Heart, Pause, Play, Sparkles, X, HeartCrack, Frown, Plus } from 'lucide-react';
import { db } from '../lib/db';

// ... (Background components: FloatingHeart, FloatingHeartsBackground, GlowOrbs remain unchanged)

// Floating Heart Component
const FloatingHeart = ({ delay, duration, size, left, animationType }: { 
  delay: number; 
  duration: number; 
  size: number; 
  left: string;
  animationType: string;
}) => {
  return (
    <div
      className="floating-heart"
      style={{
        left,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        width: size,
        height: size,
      }}
    >
      <Heart 
        className="w-full h-full text-valentine-pink/40" 
        fill="currentColor"
        style={{
          animation: animationType === 'left' ? `floatUpLeft ${duration}s linear infinite` :
                    animationType === 'right' ? `floatUpRight ${duration}s linear infinite` :
                    `floatUp ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
        }}
      />
    </div>
  );
};

// Floating Hearts Background
const FloatingHeartsBackground = () => {
  const hearts = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: Math.random() * 15,
    duration: 8 + Math.random() * 10,
    size: 15 + Math.random() * 30,
    left: `${Math.random() * 100}%`,
    animationType: Math.random() > 0.6 ? 'left' : Math.random() > 0.3 ? 'right' : 'up',
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
      {hearts.map((heart) => (
        <FloatingHeart key={heart.id} {...heart} />
      ))}
    </div>
  );
};

// Glow Orbs Background
const GlowOrbs = () => {
    // ... same as before
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="glow-orb"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,182,193,0.4) 0%, transparent 70%)',
            top: '10%',
            left: '10%',
            animationDelay: '0s',
          }}
        />
        {/* ... other orbs ... */}
      </div>
    );
};

// Hero Section
const HeroSection = ({ onYesClick, onNoClick, setMusicPlaying, onChoice }: { 
  onYesClick: () => void; 
  onNoClick: () => void;
  setMusicPlaying: (playing: boolean) => void;
  onChoice: (choice: 'yes' | 'no') => void;
}) => {
  const [titleVisible, setTitleVisible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState<{ top: string; left: string; position: 'fixed' | 'static'; transform?: string }>({ 
    top: 'auto', 
    left: 'auto', 
    position: 'static' 
  });
  const noButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const titleTimer = setTimeout(() => setTitleVisible(true), 400);
    const buttonsTimer = setTimeout(() => setButtonsVisible(true), 1000);
    return () => {
      clearTimeout(titleTimer);
      clearTimeout(buttonsTimer);
    };
  }, []);

  const handleNoButtonMove = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (noButtonRef.current) {
        // ... same evasive logic ...
        const button = noButtonRef.current;
        const rect = button.getBoundingClientRect();
        const buttonCenterX = rect.left + rect.width / 2;
        const buttonCenterY = rect.top + rect.height / 2;
  
        let mouseX = buttonCenterX;
        let mouseY = buttonCenterY;
  
        if (e) {
          if ('touches' in e) {
             mouseX = e.touches[0].clientX;
             mouseY = e.touches[0].clientY;
          } else {
             mouseX = (e as React.MouseEvent).clientX;
             mouseY = (e as React.MouseEvent).clientY;
          }
        }
  
        // Calculate vector from mouse to button center
        let deltaX = buttonCenterX - mouseX;
        let deltaY = buttonCenterY - mouseY;
  
        // If exactly on top (rare), move randomly
        if (deltaX === 0 && deltaY === 0) {
            deltaX = Math.random() - 0.5;
            deltaY = Math.random() - 0.5;
        }
  
        // Normalize
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const normalizedX = deltaX / distance;
        const normalizedY = deltaY / distance;
  
        // Jump distance (prevent too far, prevent too close)
        const jumpDist = 150 + Math.random() * 100;
        
        let newX = buttonCenterX + normalizedX * jumpDist;
        let newY = buttonCenterY + normalizedY * jumpDist;
  
        // Add some "zig zag" randomness
        newX += (Math.random() - 0.5) * 50;
        newY += (Math.random() - 0.5) * 50;
  
        // Boundary checks (keep fully on screen with padding)
        const padding = 50;
        const maxW = window.innerWidth - rect.width - padding;
        const maxH = window.innerHeight - rect.height - padding;
  
        // If hitting wall, bounce back
        if (newX < padding) newX = padding + Math.random() * 50;
        if (newX > maxW) newX = maxW - Math.random() * 50;
        if (newY < padding) newY = padding + Math.random() * 50;
        if (newY > maxH) newY = maxH - Math.random() * 50;
  
        const rotation = Math.random() * 40 - 20;

      setNoButtonPos({
        position: 'fixed',
        left: `${newX}px`,
        top: `${newY}px`,
        transform: `rotate(${rotation}deg)`
      });
    }
  }, []);

  const handleYesClick = () => {
    setMusicPlaying(true);
    onChoice('yes');
    onYesClick();
  };

  const handleNoClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    onChoice('no');
    onNoClick();
  };

  const titleWords = ["Will", "you", "be", "my", "Valentine?"];

  const noButton = (
    <button
      ref={noButtonRef}
      onMouseEnter={handleNoButtonMove}
      onTouchStart={handleNoButtonMove}
      onClick={handleNoClick}
      className="btn-no px-12 py-5 bg-transparent border-2 border-valentine-pink text-valentine-rose font-medium text-xl rounded-full hover:bg-valentine-cream flex items-center gap-3 transition-all duration-200 cursor-pointer"
      style={{ 
        zIndex: 9999, // Ensure high z-index
        ...noButtonPos
      }}
    >
      <span>No</span>
    </button>
  );

  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative z-10 px-4">
      <div className="text-center">
        {/* Animated Title */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-800 mb-4">
          {titleWords.map((word, index) => (
            <span
              key={index}
              className={`inline-block mx-2 transition-all duration-700 ${
                titleVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                transitionDelay: `${index * 150}ms`,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {word === "Valentine?" ? (
                <span className="text-valentine-red relative">
                  {word}
                  <Heart 
                    className="absolute -top-6 -right-6 w-8 h-8 text-valentine-heart animate-heart-beat" 
                    fill="currentColor"
                  />
                </span>
              ) : (
                word
              )}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p 
          className={`font-script text-2xl sm:text-3xl text-valentine-rose mb-12 transition-all duration-700 ${
            titleVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '900ms' }}
        >
          I've been waiting to ask you this...
        </p>

        {/* Buttons */}
        <div 
          className={`flex flex-col sm:flex-row gap-6 justify-center items-center transition-all duration-600 ${
            buttonsVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '1200ms' }}
        >
          <button
            onClick={handleYesClick}
            className="btn-yes group relative px-12 py-5 bg-gradient-to-r from-valentine-red to-[#FF8E8E] text-white font-semibold text-xl rounded-full shadow-valentine hover:shadow-valentine-lg flex items-center gap-3"
          >
            <Heart className="w-5 h-5" fill="currentColor" />
            <span>Yes</span>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-valentine-gold opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {noButtonPos.position === 'fixed' 
            ? createPortal(noButton, document.body) 
            : noButton
          }
        </div>
      </div>
    </section>
  );
};

// ... (MemorySection, LoveMessageSection, SuccessPopup, NoPopup, MusicPlayer remain same)

const MemorySection = () => {
    // ... same ...
     const [currentSlide, setCurrentSlide] = useState(0);
      const [isVisible, setIsVisible] = useState(false);
      const sectionRef = useRef<HTMLElement>(null);
    
      const images = [
        { src: '/img1.jpg', alt: 'Sunset beach moment' },
        { src: '/img2.jpg', alt: 'Coffee date' },
        { src: '/img3.jpg', alt: 'Flower field walk' },
        { src: '/img4.jpg', alt: 'Candlelit dinner' },
        { src: '/img5.jpg', alt: 'Stargazing night' },
      ];
    
      useEffect(() => {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
            }
          },
          { threshold: 0.2 }
        );
    
        if (sectionRef.current) {
          observer.observe(sectionRef.current);
        }
    
        return () => observer.disconnect();
      }, []);
    
      useEffect(() => {
        const interval = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % images.length);
        }, 4000);
    
        return () => clearInterval(interval);
      }, [images.length]);
    
      return (
        <section 
          ref={sectionRef}
          className="min-h-screen flex flex-col items-center justify-center py-20 px-4 relative z-10"
        >
          <div 
            className={`text-center mb-12 transition-all duration-800 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4">
              Our <span className="text-valentine-red">Memories</span>
            </h2>
            <p className="font-body text-lg text-gray-600 max-w-xl mx-auto">
              Every moment with you is a treasure I hold close to my heart
            </p>
          </div>
    
          <div 
            className={`relative w-full max-w-4xl mx-auto transition-all duration-800 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-800 ${
                    index === currentSlide 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-95'
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
    
            <div className="flex justify-center gap-3 mt-8">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-valentine-red w-8'
                      : 'bg-valentine-pink/50 hover:bg-valentine-pink'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      );
};

const LoveMessageSection = () => {
    // ... same ...
    const [isVisible, setIsVisible] = useState(false);
    const [textRevealed, setTextRevealed] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
  
    useEffect(() => {
      const observer = new IntersectionObserver(
        async ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setTimeout(() => setTextRevealed(true), 500);
          }
        },
        { threshold: 0.3 }
      );
  
      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }
  
      return () => observer.disconnect();
    }, []);
  
    const message = "From the moment I met you, my world changed forever. Your smile brightens my darkest days, your laughter is the melody my heart dances to, and your love is the greatest gift I've ever received. Every second spent with you feels like a beautiful dream I never want to wake up from. You're my best friend, my soulmate, my everything. This Valentine's Day, I want you to know that my love for you grows stronger with each passing moment. Will you make me the happiest person alive and be my Valentine?";
  
    const words = message.split(' ');
  
    return (
      <section 
        ref={sectionRef}
        className="min-h-screen flex flex-col items-center justify-center py-20 px-4 relative z-10"
      >
        <div className="max-w-3xl mx-auto text-center">
          <div 
            className={`mb-8 transition-all duration-800 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Heart 
              className="w-16 h-16 text-valentine-red mx-auto animate-heart-beat" 
              fill="currentColor"
            />
          </div>
  
          <h2 
            className={`font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-12 transition-all duration-800 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            My Love <span className="text-valentine-red">For You</span>
          </h2>
  
          <div 
            className={`font-body text-lg sm:text-xl leading-relaxed text-gray-700 transition-all duration-800 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {words.map((word, index) => (
              <span
                key={index}
                className={`inline-block mr-[0.3em] transition-all duration-50 ${
                  textRevealed 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-2'
                }`}
                style={{ 
                  transitionDelay: `${index * 30}ms`,
                  transitionTimingFunction: 'ease-out'
                }}
              >
                {word}
              </span>
            ))}
            {textRevealed && (
              <span className="inline-block w-0.5 h-6 bg-valentine-red ml-1 animate-pulse" />
            )}
          </div>
  
          <div className="mt-12 flex justify-center gap-4">
            {[...Array(5)].map((_, i) => (
              <Heart
                key={i}
                className="w-6 h-6 text-valentine-pink"
                fill="currentColor"
                style={{
                  animation: `float 2s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </section>
    );
};

const SuccessPopup = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    // ... same ...
     const [confetti, setConfetti] = useState<Array<{ id: number; color: string; left: string; delay: number }>>([]);
      
        useEffect(() => {
          if (isOpen) {
            const colors = ['#FF6B6B', '#FFB6C1', '#FFD700', '#FF4757', '#E8A4B8'];
            const newConfetti = Array.from({ length: 50 }, (_, i) => ({
              id: i,
              color: colors[Math.floor(Math.random() * colors.length)],
              left: `${Math.random() * 100}%`,
              delay: Math.random() * 2,
            }));
            setConfetti(newConfetti);
      
            setTimeout(() => setConfetti([]), 5000);
          }
        }, [isOpen]);
      
        if (!isOpen) return null;
      
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={onClose}
            />
            {confetti.map((c) => (
              <div
                key={c.id}
                className="confetti"
                style={{
                  backgroundColor: c.color,
                  left: c.left,
                  animationDelay: `${c.delay}s`,
                }}
              />
            ))}
            <div className="popup-animate relative bg-white rounded-3xl p-8 sm:p-12 max-w-lg mx-4 text-center shadow-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
      
              <div className="mb-6">
                <Heart 
                  className="w-20 h-20 text-valentine-red mx-auto animate-heart-beat" 
                  fill="currentColor"
                />
              </div>
      
              <h3 className="font-display text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                Yayyyy <span className="text-valentine-red">❤️</span>
              </h3>
      
              <p className="font-script text-2xl text-valentine-rose mb-2">
                I knew it!
              </p>
      
              <p className="font-body text-lg text-gray-600">
                Let's Get The Valentine Started <span className="text-2xl">🥰</span>
              </p>
      
              <div className="mt-8 flex justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Sparkles
                    key={i}
                    className="w-6 h-6 text-valentine-gold"
                    style={{
                      animation: `sparkle 1.5s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
};

const NoPopup = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    // ... same ...
    if (!isOpen) return null;
      
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />
      
            <div className="popup-animate relative bg-white rounded-3xl p-8 sm:p-12 max-w-lg mx-4 text-center shadow-2xl border-4 border-gray-100">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
      
              <div className="mb-6">
                <HeartCrack 
                  className="w-20 h-20 text-gray-400 mx-auto animate-pulse" 
                  fill="currentColor"
                  fillOpacity="0.2"
                />
              </div>
      
              <h3 className="font-display text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                You tried so hard to tap No... 💔
              </h3>
      
              <p className="font-script text-2xl text-gray-500 mb-6">
                But my love is stubborn!
              </p>
      
              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                 <p className="font-body text-lg text-gray-600">
                  Please reconsider? 🥺
                </p>
              </div>
              
              <div className="flex justify-center gap-4">
                  <Frown className="w-8 h-8 text-gray-400 animate-bounce" />
              </div>
            </div>
          </div>
        );
};

const MusicPlayer = ({ isPlaying, onToggle }: { isPlaying: boolean; onToggle: () => void }) => {
    // ... same ...
    return (
        <button
          onClick={onToggle}
          className="music-btn fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-valentine-pink to-valentine-rose text-white shadow-lg flex items-center justify-center hover:shadow-valentine"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
          {isPlaying && (
            <div className="absolute inset-0 rounded-full animate-pulse-glow" />
          )}
        </button>
      );
};

// Main Component
const ValentinePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [showNoPopup, setShowNoPopup] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [creating, setCreating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/Easy (Jeje).mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (musicPlaying) {
        audioRef.current.play().catch(() => {
          setMusicPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [musicPlaying]);

  const toggleMusic = () => {
    setMusicPlaying(!musicPlaying);
  };

  const trackChoice = async (choice: 'yes' | 'no') => {
    if (!id) {
       console.log('Demo Mode: No DB update');
       return;
    }
    try {
        await db.query('UPDATE cards SET status = $1 WHERE id = $2', [choice, id]);
        console.log(`Updated status to ${choice}`);
    } catch (err) {
        console.error('Failed to update status', err);
    }
  };

  const createCard = async () => {
    setCreating(true);
    const newId = Math.random().toString(36).substring(2, 10);
    try {
        await db.query('INSERT INTO cards (id, status) VALUES ($1, $2)', [newId, 'waiting']);
        navigate(`/track/${newId}`);
    } catch (err) {
        console.error('Create error:', err);
        alert('Could not create card. Refresh and try again.');
    } finally {
        setCreating(false);
    }
  };

  return (
    <div className="min-h-screen animated-gradient relative">
      <GlowOrbs />
      <FloatingHeartsBackground />

      {/* Navigation / Create Button */}
      <div className="fixed top-6 right-6 z-50">
        <button
            onClick={createCard}
            disabled={creating}
            className="group flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-md hover:bg-white text-valentine-rose font-semibold rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 border border-pink-100"
        >
            {creating ? (
                <Sparkles className="w-5 h-5 animate-spin" />
            ) : (
                <Plus className="w-5 h-5" />
            )}
            <span>{creating ? 'Creating...' : 'Send to your Loved One 💝'}</span>
        </button>
      </div>

      <main className="relative z-10">
        <HeroSection 
          onYesClick={() => setShowPopup(true)} 
          onNoClick={() => setShowNoPopup(true)}
          setMusicPlaying={setMusicPlaying}
          onChoice={trackChoice}
        />
        <MemorySection />
        <LoveMessageSection />
      </main>

      <MusicPlayer isPlaying={musicPlaying} onToggle={toggleMusic} />

      <SuccessPopup isOpen={showPopup} onClose={() => setShowPopup(false)} />
      <NoPopup isOpen={showNoPopup} onClose={() => setShowNoPopup(false)} />
    </div>
  );
}

export default ValentinePage;
