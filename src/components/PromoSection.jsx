'use client';

import { memo } from 'react';
import { promoCards } from '../lib/constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PromoSection = memo(({ currentPromoIndex, actualSlideIndex, isAutoRotating, onPrev, onNext, onGoTo }) => (
    <div className="promo-section-wrapper relative">
        {/* Enhanced Cards Container */}
        <div className="promo-carousel-container relative">
            {/* Navigation Buttons - Moved inside carousel container */}
            <button
                onClick={onPrev}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/95 hover:bg-white border border-gray-300 rounded-full p-3 shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm"
            >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>

            <button
                onClick={onNext}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/95 hover:bg-white border border-gray-300 rounded-full p-3 shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm"
            >
                <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
            <div className="promo-carousel-track">
                <div
                    className="promo-slides-wrapper"
                    style={{
                        transform: `translate3d(-${currentPromoIndex * 10}%, 0, 0)`,
                    }}
                >
                    {/* Render original slides */}
                    {promoCards.map((card, index) => (
                        <div key={`original-${card.id}`} className="promo-slide">
                            <div className="promo-card-enhanced">
                                <div className="promo-image-wrapper">
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        className="promo-image"
                                        loading="lazy"
                                    />
                                </div>

                                <div className="promo-content-wrapper">
                                    <div className="promo-content">
                                        <h3 className="promo-title">{card.title}</h3>
                                        <p className="promo-description">{card.description}</p>
                                        <button className="promo-cta-button">
                                            Explore Collection
                                        </button>
                                    </div>

                                    {/* Progress indicator for current slide */}
                                    {index === currentPromoIndex && isAutoRotating && (
                                        <div className="promo-progress-bar">
                                            <div className="promo-progress-fill" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Render duplicated slides for infinite effect */}
                    {promoCards.map((card, index) => (
                        <div key={`duplicate-${card.id}`} className="promo-slide">
                            <div className="promo-card-enhanced">
                                <div className="promo-image-wrapper">
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        className="promo-image"
                                        loading="lazy"
                                    />
                                </div>

                                <div className="promo-content-wrapper">
                                    <div className="promo-content">
                                        <h3 className="promo-title">{card.title}</h3>
                                        <p className="promo-description">{card.description}</p>
                                        <button className="promo-cta-button">
                                            Explore Collection
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Enhanced Dot Indicators */}
        <div className="promo-indicators">
            {promoCards.map((_, index) => (
                <button
                    key={index}
                    onClick={(e) => onGoTo(index, e)}
                    className={`promo-dot ${index === (actualSlideIndex % promoCards.length) ? 'active' : ''}`}
                />
            ))}
        </div>
    </div>
));

export default PromoSection;

