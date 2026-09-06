export type ThemeId = 
  | 'artistic'     // ✨ Artistic Flair (Editorial, Architectural Noir & Champagne Gold)
  | 'immortal'     // ☯ Immortal Realm (Donghua / Xianxia)
  | 'pixel'        // ⛏ Pixel Frontier (Minecraft voxel / 8-bit adventure)
  | 'tactical'     // 🎯 Mission: Jeric (Valorant tactical HUD)
  | 'legendary'    // ⚔ Legendary Chronicle (Mobile Legends dramatic gold / hero)
  | 'clash'        // 🏰 Clash Kingdom (Clash of Clans strategy / playful)
  | 'mythic';      // 🐉 Mythic Dynasty (Honor of Kings / Chinese mythology)

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  verifiedYear: string;
  location: string;
  responsibilities: string[];
  skillsDemonstrated: string[];
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  badgeLevel: string;
  description: string;
}

export interface SkillCategory {
  title: string;
  items: {
    name: string;
    level: string;
    description: string;
    iconName: string;
  }[];
}

export interface CaseStudySection {
  title: string;
  content: string;
  highlights: string[];
}

export interface SettingsState {
  soundEnabled: boolean;
  fontSize: 'standard' | 'large' | 'compact';
  accentColor: string;
  reducedMotion: boolean;
  themeMode: 'dark' | 'dim';
}
