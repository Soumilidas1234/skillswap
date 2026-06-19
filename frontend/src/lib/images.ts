const base = '/images'

export const images = {
  hero: `${base}/hero.png`,
  authBg: `${base}/auth-bg.png`,
  logo: `${base}/logo.png`,
  defaultSkill: `${base}/default-skill.png`,
  notFound: `${base}/404.png`,
  emptyState: `${base}/empty-state.png`,
  aboutBanner: `${base}/about-banner.png`,
  featuresBanner: `${base}/features-banner.png`,
  dashboardWelcome: `${base}/dashboard-welcome.png`,
  ctaBg: `${base}/cta-bg.png`,
  certificateBg: `${base}/certificate-bg.png`,
  categories: {
    programming: `${base}/categories/programming.png`,
    design: `${base}/categories/design.png`,
    languages: `${base}/categories/languages.png`,
    music: `${base}/categories/music.png`,
    business: `${base}/categories/business.png`,
    photography: `${base}/categories/photography.png`,
    fitness: `${base}/categories/fitness.png`,
    cooking: `${base}/categories/cooking.png`,
  } as Record<string, string>,
  avatars: {
    'Sarah Chen': `${base}/avatars/sarah-chen.png`,
    'Marcus Johnson': `${base}/avatars/marcus-johnson.png`,
    'Priya Sharma': `${base}/avatars/priya-sharma.png`,
  } as Record<string, string>,
  steps: [
    `${base}/steps/step-01-profile.png`,
    `${base}/steps/step-02-browse.png`,
    `${base}/steps/step-03-request.png`,
    `${base}/steps/step-04-earn.png`,
  ],
}

export function getCategoryImage(slug: string): string | undefined {
  return images.categories[slug]
}
