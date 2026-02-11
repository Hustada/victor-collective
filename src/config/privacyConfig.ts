export interface PrivacyPolicy {
  appName: string;
  slug: string;
  appIcon?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  lastUpdated: string;
  effectiveDate: string;
  contactEmail: string;
  sections: {
    overview: string;
    dataCollected: {
      title: string;
      items: {
        type: string;
        description: string;
        purpose: string;
      }[];
    };
    dataUsage: string[];
    thirdPartyServices: {
      name: string;
      purpose: string;
      privacyUrl?: string;
    }[];
    dataRetention: string;
    userRights: string[];
    childrenPrivacy: string;
    changes: string;
  };
}

export const privacyPolicies: Record<string, PrivacyPolicy> = {
  stakks: {
    appName: 'Stakks',
    slug: 'stakks',
    lastUpdated: '2026-01-08',
    effectiveDate: '2026-01-08',
    contactEmail: 'victorhustad@victorcollective.com',
    sections: {
      overview: `Stakks ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.`,
      dataCollected: {
        title: 'Information We Collect',
        items: [
          {
            type: 'Authentication Data',
            description: 'Email address and basic profile information when you sign in with Google',
            purpose: 'To create and manage your account',
          },
          {
            type: 'User Content',
            description: 'Flashcard decks, cards, and study progress you create within the app',
            purpose: 'To provide the core functionality of the app',
          },
          {
            type: 'Usage Data',
            description: 'App interaction data such as features used and study sessions',
            purpose: 'To improve the app experience and fix bugs',
          },
        ],
      },
      dataUsage: [
        'Provide and maintain the app functionality',
        'Sync your data across devices',
        'Improve and optimize the app experience',
        'Send important updates about the service',
        'Respond to your requests and support inquiries',
      ],
      thirdPartyServices: [
        {
          name: 'Google Sign-In',
          purpose: 'Authentication and account management',
          privacyUrl: 'https://policies.google.com/privacy',
        },
        {
          name: 'Firebase',
          purpose: 'Data storage and synchronization',
          privacyUrl: 'https://firebase.google.com/support/privacy',
        },
        {
          name: 'Expo',
          purpose: 'App updates and crash reporting',
          privacyUrl: 'https://expo.dev/privacy',
        },
      ],
      dataRetention: `We retain your data for as long as your account is active. You can delete your account and all associated data at any time through the app settings. Upon account deletion, your data will be permanently removed within 30 days.`,
      userRights: [
        'Access your personal data',
        'Correct inaccurate data',
        'Delete your account and data',
        'Export your data',
        'Opt out of non-essential communications',
      ],
      childrenPrivacy: `Stakks is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.`,
      changes: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.`,
    },
  },
  // Add more apps here as needed:
  // 'another-app': { ... }
};

export const getPrivacyPolicy = (slug: string): PrivacyPolicy | undefined => {
  return privacyPolicies[slug];
};

export const getAllPrivacyPolicies = (): PrivacyPolicy[] => {
  return Object.values(privacyPolicies);
};
