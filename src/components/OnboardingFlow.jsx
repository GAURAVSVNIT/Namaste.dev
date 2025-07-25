"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, User, Store, Scissors, Palette } from 'lucide-react';

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

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (currentStep === 1 && selectedRole) {
      setCurrentStep(2);
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMultiSelectChange = (questionId, option) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      const isSelected = currentAnswers.includes(option);
      
      if (isSelected) {
        // Remove from selection
        return {
          ...prev,
          [questionId]: currentAnswers.filter(item => item !== option)
        };
      } else {
        // Add to selection
        return {
          ...prev,
          [questionId]: [...currentAnswers, option]
        };
      }
    });
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { auth } = await import('@/lib/firebase');
      const { updateUser } = await import('@/lib/user');
      
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      // Prepare profile data
      const profileData = {
        role: selectedRole,
        onboardingCompleted: true,
        onboardingAnswers: answers,
        onboardingCompletedAt: new Date().toISOString(),
      };
      
      // Update user profile
      await updateUser(user.uid, profileData);
      
      console.log('Onboarding completed successfully:', { role: selectedRole, answers });
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsSubmitting(false);
      // You might want to show an error message to the user
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
    return (currentStep / 4) * 100;
  };

  const currentQuestions = selectedRole ? roleQuestions[selectedRole] : [];
  const questionIndex = currentStep - 2;
  const currentQuestion = currentQuestions[questionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-misty_rose via-pink to-cherry_blossom_pink flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Main Content */}
          <div className="space-y-8">
            {/* Progress Bar */}
            <div className="w-full bg-white/30 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-baker-miller_pink to-rose_pompadour h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage()}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
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
                          className={`p-6 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                            selectedRole === role.id
                              ? 'border-rose_pompadour bg-gradient-to-r from-rose_pompadour/20 to-baker-miller_pink/20 shadow-lg'
                              : 'border-white/50 bg-white/30 hover:bg-white/40'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {selectedRole === role.id && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-rose_pompadour/10 to-baker-miller_pink/10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                          <div className="relative z-10 text-center space-y-3">
                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                              selectedRole === role.id 
                                ? 'bg-rose_pompadour text-white shadow-lg' 
                                : 'bg-white/50 text-gray-600'
                            }`}>
                              <Icon size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">{role.label}</h3>
                            <p className="text-sm text-gray-600">{role.description}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {selectedRole && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <button
                        onClick={handleContinue}
                        className="bg-gradient-to-r from-rose_pompadour to-baker-miller_pink text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow duration-300 flex items-center gap-2 mx-auto"
                      >
                        Continue
                        <ChevronRight size={20} />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {(currentStep === 2 || currentStep === 3) && currentQuestion && (
                <motion.div
                  key={`step${currentStep}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-gray-800">{currentQuestion.question}</h2>
                    <p className="text-lg text-gray-600">Step {currentStep} of 4</p>
                  </div>

                  <div className="max-w-md mx-auto">
                    {currentQuestion.type === 'multi-select' ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 mb-4 text-center">Select all that apply</p>
                        {currentQuestion.options.map((option) => {
                          const isSelected = (answers[currentQuestion.id] || []).includes(option);
                          return (
                            <motion.button
                              key={option}
                              onClick={() => handleMultiSelectChange(currentQuestion.id, option)}
                              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                                isSelected
                                  ? 'border-rose_pompadour bg-gradient-to-r from-rose_pompadour/20 to-baker-miller_pink/20'
                                  : 'border-white/50 bg-white/30 hover:bg-white/40'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-gray-800">{option}</span>
                                {isSelected && (
                                  <Check size={20} className="text-rose_pompadour" />
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    ) : currentQuestion.type === 'select' ? (
                      <div className="space-y-3">
                        {currentQuestion.options.map((option) => (
                          <motion.button
                            key={option}
                            onClick={() => handleAnswerChange(currentQuestion.id, option)}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                              answers[currentQuestion.id] === option
                                ? 'border-rose_pompadour bg-gradient-to-r from-rose_pompadour/20 to-baker-miller_pink/20'
                                : 'border-white/50 bg-white/30 hover:bg-white/40'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-gray-800">{option}</span>
                              {answers[currentQuestion.id] === option && (
                                <Check size={20} className="text-rose_pompadour" />
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder={currentQuestion.placeholder}
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="w-full p-4 rounded-xl border-2 border-white/50 bg-white/30 placeholder-gray-500 text-gray-800 focus:border-rose_pompadour focus:outline-none"
                      />
                    )}
                  </div>

                  {((currentQuestion.type === 'multi-select' && answers[currentQuestion.id]?.length > 0) || 
                    (currentQuestion.type !== 'multi-select' && answers[currentQuestion.id]) ||
                    (currentQuestion.type === 'text' && currentQuestion.id === 'portfolio')) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <button
                        onClick={handleContinue}
                        className="bg-gradient-to-r from-rose_pompadour to-baker-miller_pink text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow duration-300 flex items-center gap-2 mx-auto"
                      >
                        {currentStep === 3 ? 'Review' : 'Next'}
                        <ChevronRight size={20} />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-gray-800">Review Your Answers</h2>
                    <p className="text-lg text-gray-600">Please confirm your information</p>
                  </div>

                  <div className="bg-white/30 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose_pompadour flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">Role: </span>
                        <span className="text-gray-600">{roles.find(r => r.id === selectedRole)?.label}</span>
                      </div>
                    </div>

                    {currentQuestions.map((question) => (
                      <div key={question.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-baker-miller_pink flex items-center justify-center mt-1">
                          <Check size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{question.question}</p>
                          <p className="text-gray-600">
                            {Array.isArray(answers[question.id]) 
                              ? answers[question.id].join(', ') 
                              : answers[question.id] || 'Not answered'
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <motion.button
                      onClick={handleFinish}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-rose_pompadour to-baker-miller_pink text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow duration-300 flex items-center gap-2 mx-auto disabled:opacity-50"
                      whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          Finishing...
                        </>
                      ) : (
                        <>
                          <Check size={20} />
                          Finish
                        </>
                      )}
                    </motion.button>
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
