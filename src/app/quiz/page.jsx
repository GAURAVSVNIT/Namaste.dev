'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/quiz'; 
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { getUserById } from '@/lib/user';
import Link from 'next/link';
import { Sparkles, ShoppingBag, ArrowRight, PenLine, Share, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import '@/static/quiz/quiz.css'; 
import ShareModal from '@/components/common/ShareBox';
import SplitText from '@/blocks/TextAnimations/SplitText/SplitText';

export function MerchantPromo() {
  return (
    <section className="merchant-promo-section">
      <div className="merchant-promo-inner">
        <div className="merchant-icon">
          <ShoppingBag size={48} strokeWidth={2.2} />
        </div>
        <h2>
          <SplitText 
                  text="Boost Your Brand with Interactive Quizzes" 
                  splitType="chars"
                  delay={80}
                  duration={0.8}
                  ease="power3.out"
                  from={{ opacity: 0, y: 60, rotateX: -90 }}
                  to={{ opacity: 1, y: 0, rotateX: 0 }}
                  threshold={0.2}
                  className="quiz-merchant-split"
                />
        </h2>
        <p>
          Want to launch a new product, or highlight a trending collection?
          Create an engaging quiz that reflects your brand’s story or a general fashion quiz.
          Share it on the <strong>Trendora</strong> community and amplify your reach on social media.
        </p>

        <Link href="/quiz/create" className="merchant-cta-btn">
          <PenLine size={18} className='mr-2' /> &nbsp; Create a Quiz &nbsp;<ArrowRight size={18} className="ml-2" />
        </Link>
      </div>
    </section>
  );
}


export default function QuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [quizLink, setQuizLink] = useState(null);
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchQuizzes() {
      const q = query(collection(db, 'quizzes'), orderBy('created_on', 'desc'));
      const snapshot = await getDocs(q);
      setQuizzes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }

    fetchQuizzes();
  }, []);


  // set bg to white so that UI dont break
  useEffect(() => {
  document.body.style.background = "white";

  return () => {
    document.body.style.background = ""; 
  };
}, []);


  useEffect(() => {
    if (!authLoading && user) {
      fetchUserProfile();
      console.log("Logged-in user info:", user);
    }
  }, [authLoading, user]);

  const fetchUserProfile = async () => {
    try {
      const profile = await getUserById(user.uid);
      setUserProfile(profile);
      console.log("User Profile: ",profile)
    } 
    catch (error) {
      console.error('Error loading user profile:', error);
    }
  }
  

  const getCoverImage = (quiz) =>
    quiz.coverImage?.trim()
      ? quiz.coverImage
      : `/quiz/quiz_placeholder.png`;





  return (
    <div className="quiz-landing-container">

      <ShareModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        copyLink={quizLink}
        whatsappMessage="Try this stylish fashion quiz!"
        title="Share quiz"
        subtitle="Let the world see your style&nbsp;IQ"
      />

      {
        userProfile?.role === "merchant" && <MerchantPromo />
      }

      {/* Admin-only Add Quiz button */}
      {
        userProfile?.role === "admin" && (
          <div className="admin-add-quiz-section" style={{ textAlign: 'center', margin: '2rem 0' }}>
            <Link href="/quiz/create" className="merchant-cta-btn">
              <PenLine size={18} className='mr-2' /> &nbsp; Add Quiz &nbsp;<ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        )
      }

      {/* Fashion Creator Add Quiz button */}
      {
        userProfile?.role === "fashion_creator" && (
          <div className="fashion-creator-add-quiz-section" style={{ textAlign: 'center', margin: '2rem 0' }}>
            <Link href="/quiz/create" className="merchant-cta-btn">
              <PenLine size={18} className='mr-2' /> &nbsp; Create Quiz &nbsp;<ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        )
      }

      <h1 className="quiz-heading">All Quizzes</h1>
        {/* <div className="quiz-card-grid"> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 quizzes-container">
        {quizzes.map((quiz) => (
        
        <div key={quiz.id}>
        
        <div
            className="quiz-card-link cursor-pointer"
            onClick={() => {router.push(`/quiz/play/${quiz.quiz_id}`)}}
          >
            <div className="quiz-card-image-container group">
              <img
                src={getCoverImage(quiz)}
                alt={quiz.title}
                className="quiz-card-image"
              />
          </div>
          

                {/* Share button (top-right) */}
                <button className="quiz-share-btn"
                    onClick={(e) => {
                      e.preventDefault(); 
                      e.stopPropagation(); 
                      setModalOpen(true);
                      setQuizLink(window.location.href + `/play/${quiz.quiz_id}`)
                    }}>
                    <Share2 size={18} />
                </button>

                {/* Start quiz overlay (bottom) */}
                <div className="quiz-start-overlay">
                  <Sparkles size={16} className="mr-1" />&nbsp;
                  Start Quiz
                </div>
              </div>

              <div className="quiz-card-content">
                <h2 className="quiz-card-title">{quiz.title}</h2>
                <p className="quiz-card-description">
                  {quiz.description?.slice(0, 100)}...
                </p>
                {quiz.created_by && (
                  <p className="quiz-card-creator">By: {quiz.created_by}</p>
                )}
              </div>

              {/* Mobile-only bottom buttons */}
              <div className="quiz-card-mobile-actions sm:hidden">
                <button
                  className="quiz-start-btn cursor-pointer"
                  onClick={() => router.push(`/quiz/play/${quiz.quiz_id}`)}
                >
                  Start Quiz
                </button>
                <button
                  className="quiz-share-btn-alt cursor-pointer"
                  onClick={() => {
                    setModalOpen(true);
                    setQuizLink(window.location.origin + `/quiz/play/${quiz.quiz_id}`);
                  }}
                >
                  Share Quiz
                </button>
              </div>

        </div> 

        ))}
      </div>
    </div>
  );
}
