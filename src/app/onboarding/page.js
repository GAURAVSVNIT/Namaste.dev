import OnboardingFlow from '@/components/OnboardingFlow';
import '@/static/Onboarding.css';

export const metadata = {
  title: 'Onboarding - Fashion Hub',
  description: 'Complete your profile setup to get started',
};

/**
 * Renders the onboarding page with the profile setup flow.
 */
export default function OnboardingPage() {
  return (
    <OnboardingFlow />
  );
}