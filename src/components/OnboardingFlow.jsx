"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, User, Store, Scissors, Palette, ArrowLeft } from 'lucide-react';
import '../static/Onboarding.css';

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    { id: 'member', label: 'Member', icon: User, description: 'Fashion enthusiast' },
    { id: 'merchant', label: 'Merchant', icon: Store, description: 'Online seller' },
    { id: 'fashion_creator', label: 'Fashion Creator', icon: Scissors, description: 'Professional tailor, designer, or fashion creator' }
  ];

  const roleQuestions = {
    member: [
      {
        id: 'style',
        question: 'What\'s your fashion style?',
        type: 'select',
        options: ['Casual', 'Formal', 'Boho', 'Streetwear', 'Vintage', 'Minimalist']
      },
      {
        id: 'brands',
        question: 'What are your favorite brands?',
        type: 'text',
        placeholder: 'e.g., Nike, Zara, H&M...'
      },
      {
        id: 'budget',
        question: 'What\'s your typical clothing budget per month?',
        type: 'select',
        options: ['Under $50', '$50-$100', '$100-$200', '$200-$500', 'Over $500']
      }
    ],
    merchant: [
      {
        id: 'products',
        question: 'What products do you sell?',
        type: 'select',
        options: ['Clothing', 'Accessories', 'Shoes', 'Bags', 'Jewelry', 'Mixed']
      },
      {
        id: 'store_size',
        question: 'What\'s your store size?',
        type: 'select',
        options: ['Small (1-10 products)', 'Medium (11-50 products)', 'Large (51-200 products)', 'Enterprise (200+ products)']
      },
      {
        id: 'online_presence',
        question: 'Are you already selling online?',
        type: 'select',
        options: ['Yes, actively selling', 'Yes, but just started', 'No, but planning to', 'No, not interested']
      }
    ],
    fashion_creator: [
      {
        id: 'skills',
        question: 'What are your main skills?',
        type: 'multi-select',
        options: [
          'Alterations & Repairs',
          'Custom Tailoring', 
          'Pattern Making',
          'Fashion Design',
          'Embellishment & Decoration',
          'Upcycling & Reconstruction'
        ]
      },
      {
        id: 'experience',
        question: 'How many years of experience do you have?',
        type: 'select',
        options: ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', 'Over 10 years']
      },
      {
        id: 'portfolio',
        question: 'Portfolio or work samples link (optional)',
        type: 'text',
        placeholder: 'https://yourportfolio.com or Instagram handle'
      }
    ]
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setTimeout(() => handleContinue(), 400);
  };

  const handleContinue = () => {
    if (currentStep === 1 && selectedRole) {
      setCurrentStep(2);
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if(roleQuestions[selectedRole][currentStep - 2]?.type === 'select') {
        setTimeout(() => handleContinue(), 300);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const { auth } = await import('@/lib/firebase');
      const { updateUser } = await import('@/lib/user');
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user found');
      
      const profileData = {
        role: selectedRole,
        onboardingCompleted: true,
        onboardingAnswers: answers,
        onboardingCompletedAt: new Date().toISOString(),
      };
      
      await updateUser(user.uid, profileData);
      console.log('Onboarding completed successfully:', { role: selectedRole, answers });
      setTimeout(() => { window.location.href = '/'; }, 1000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsSubmitting(false);
    }
  };

  const getBlobText = () => {
    switch (currentStep) {
      case 1:
        return selectedRole ? `I work as a ${roles.find(r => r.id === selectedRole)?.label}` : 'Choose your role';
      case 2:
      case 3:
        return 'Tell us about yourself...';
      case 4:
        return 'Almost done!';
      default:
        return 'Getting started...';
    }
  };

  const getProgressPercentage = () => {
    const totalSteps = (roleQuestions[selectedRole]?.length || 0) + 1;
    if (currentStep === 1) return 10;
    return ((currentStep) / (totalSteps + 1)) * 100;
  };

  const currentQuestions = selectedRole ? roleQuestions[selectedRole] : [];
  const questionIndex = currentStep - 2;
  const currentQuestion = currentQuestions[questionIndex];

  return (
    <div className="onboarding-background min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Main Content */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card space-y-6 p-8"
                >
                  <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-gray-800">Welcome!</h1>
                    <p className="text-xl text-gray-600">What best describes you?</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      return (
                        <motion.button
                          key={role.id}
                          onClick={() => handleRoleSelect(role.id)}
                          className={`role-card theme-${role.id} ${
                            selectedRole === role.id ? 'selected' : ''
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="icon-wrapper">
                            <Icon size={24} />
                          </div>
                          <h3>{role.label}</h3>
                          <p>{role.description}</p>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {(currentStep >= 2 && currentStep <= (currentQuestions.length + 1)) && (
                <motion.div
                  key={`step${currentStep}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="glass-card questionnaire-container p-8"
                >
                  <div className="progress-bar-container">
                    <motion.div
                      className="progress-bar"
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage()}%` }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                  </div>
                  {currentQuestion ? (
                    <>
                      <div className="question-header">
                        <h2 className="question-title">{currentQuestion.question}</h2>
                        <p className="question-subtitle">Step {currentStep - 1} of {currentQuestions.length}</p>
                      </div>

                      {currentQuestion.type === 'select' ? (
                        <div className="answers-grid">
                          {currentQuestion.options.map((option) => (
                            <motion.div
                              key={option}
                              onClick={() => handleAnswerChange(currentQuestion.id, option)}
                              className={`answer-card ${answers[currentQuestion.id] === option ? 'selected' : ''}`}
                              whileHover={{ y: -5 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                            >
                              <div className="answer-card-header">
                                <div className="answer-card-icon">
                                  <Check size={20} />
                                </div>
                                <span className="answer-card-label">{option}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder={currentQuestion.placeholder}
                          value={answers[currentQuestion.id] || ''}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          className="input-field"
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <div className="question-header">
                        <h2 className="question-title">Review Your Answers</h2>
                        <p className="question-subtitle">Please confirm your information is correct.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="answer-card selected">
                          <div className="answer-card-header">
                            <div className="answer-card-icon"><User size={20} /></div>
                            <div className="w-full">
                              <span className="answer-card-label">Your Role</span>
                              <p className="text-primary-100">{roles.find(r => r.id === selectedRole)?.label}</p>
                            </div>
                          </div>
                        </div>
                        {currentQuestions.map((question) => (
                          <div key={question.id} className="answer-card">
                            <div className="answer-card-header">
                              <div className="answer-card-icon"><Check size={20} /></div>
                              <div className="w-full">
                                <span className="answer-card-label">{question.question}</span>
                                <p className="text-primary-100">{answers[question.id] || 'Not answered'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="questionnaire-nav">
                    <button onClick={handleBack} className="back-button flex items-center gap-2">
                      <ArrowLeft size={16} />
                      Back
                    </button>
                    {currentQuestion && currentQuestion.type === 'text' && answers[currentQuestion.id] ? (
                      <button onClick={handleContinue} className="onboarding-button">
                        Continue
                      </button>
                    ) : !currentQuestion ? (
                      <motion.button
                        onClick={handleFinish}
                        disabled={isSubmitting}
                        className="onboarding-button"
                        whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                      >
                        {isSubmitting ? (
                          <div className="onboarding-loading" />
                        ) : (
                          'Finish Setup'
                        )}
                      </motion.button>
                    ) : null}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side - Animated Blob */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              <motion.div
                className="w-80 h-80 rounded-full bg-gradient-to-br from-baker-miller_pink to-rose_pompadour relative overflow-hidden shadow-2xl"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0],
                  borderRadius: ["50%", "45%", "50%"]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-rose_pompadour/30 to-baker-miller_pink/30"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  key={getBlobText()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center text-white"
                >
                  <p className="text-xl font-bold max-w-48 leading-relaxed">
                    {getBlobText()}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
