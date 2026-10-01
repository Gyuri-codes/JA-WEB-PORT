import { GraduationCap, Award, BookOpen, MapPin, Calendar, CheckCircle2, Building, ShieldCheck } from 'lucide-react';
import { ThemeId } from '../types';
import { PERSONAL_INFO, THEME_CONFIGS } from '../data/portfolioData';

interface EducationSectionProps {
  currentTheme: ThemeId;
}

export function EducationSection({ currentTheme }: EducationSectionProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];

  const courseworkPillars = [
    {
      title: "Front Office Operations & PMS",
      code: "HM-FO101",
      desc: "Reservation workflows, room assignments, guest profiling, billing systems, and night audit protocols."
    },
    {
      title: "Food & Beverage Service Management",
      code: "HM-FB202",
      desc: "Table service styles (French, American, Russian), beverage pairing, cellar management, and banqueting."
    },
    {
      title: "Culinary Arts & Commercial Kitchen",
      code: "HM-CK303",
      desc: "Food sanitation (HACCP), knife skills, stocks/sauces, butchery, culinary nutrition, and hot/cold line execution."
    },
    {
      title: "Commercial Baking & Pastry Craft",
      code: "HM-BP304",
      desc: "Yeast leavening, artisan doughs, pastries, confectionery art, portion cost control, and bakery hygiene."
    },
    {
      title: "Institutional Housekeeping & Hygiene",
      code: "HM-HK205",
      desc: "Room inspection standards, chemical safety, laundry plant operations, and eco-friendly hospitality practices."
    },
    {
      title: "Events, Meetings & Protocol Services",
      code: "HM-EM401",
      desc: "Event design, bidding & proposals, supplier contract negotiations, venue logistics, and diplomatic protocol."
    }
  ];

  const milestones = [
    {
      year: "2022 – Present",
      title: "Senior Standing (4th Year)",
      desc: "Engaged in advanced hospitality research, senior practicum readiness, and multi-skill laboratory competencies at Asian College."
    },
    {
      year: "2024",
      title: "Supervised Industry Learning (SIL) Completion",
      desc: "Exemplary practicum performance at Tootie's Kitchen across food preparation, customer service, and dining room efficiency."
    },
    {
      year: "2024 – 2026",
      title: "National TVET Competency Certification",
      desc: "Attained accredited TESDA NC II & NC III credentials aligning academic hospitality training with Philippine and ASEAN workforce standards."
    }
  ];

  return (
    <section id="education" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-[#222222]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.45em] text-[#C5A059] block mb-3 font-medium">
            Academic Foundation & Discipline
          </span>
          <h2 
            className="text-3xl sm:text-5xl font-serif italic font-light text-white tracking-tight"
            style={{ fontFamily: themeConfig.fontHeadline }}
          >
            Education & Academic Journey
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#999999] max-w-2xl mx-auto font-light leading-relaxed">
            Rigorous undergraduate education in hospitality management, integrating guest experience theory, culinary science, and operational leadership.
          </p>
        </div>

        {/* Primary Institution Showcase Card */}
        <div className="p-8 sm:p-10 bg-[#161616] border border-[#333333] mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-[#262626]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1F1F1F] border border-[#333333] text-[#C5A059] text-[10px] font-mono uppercase tracking-widest mb-4">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{PERSONAL_INFO.education.status}</span>
              </div>
              
              <h3 
                className="text-2xl sm:text-3xl font-serif italic text-white tracking-wide mb-2"
                style={{ fontFamily: themeConfig.fontHeadline }}
              >
                {PERSONAL_INFO.education.degree}
              </h3>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#999999] font-mono mt-3">
                <span className="flex items-center gap-1.5 text-white">
                  <Building className="w-4 h-4 text-[#C5A059]" />
                  <span>{PERSONAL_INFO.education.institution}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#C5A059]" />
                  <span>{PERSONAL_INFO.education.location}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#C5A059]" />
                  <span>Expected Graduation: 2026</span>
                </span>
              </div>
            </div>

            <div className="lg:text-right shrink-0">
              <div className="inline-block px-4 py-2 bg-[#121212] border border-[#C5A059]/50 text-left lg:text-right">
                <div className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">Accreditation</div>
                <div className="text-xs font-mono font-semibold text-[#C5A059]">CHED & TESDA TVET Framework</div>
              </div>
            </div>
          </div>

          {/* Academic Highlights Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-xs text-[#999999]">
            <div className="p-4 bg-[#121212] border border-[#262626]">
              <div className="text-[#C5A059] font-mono text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Theory to Practice</span>
              </div>
              <p className="leading-relaxed font-light">
                Comprehensive training balancing hotel property management systems with laboratory culinary preparation and dining room staging.
              </p>
            </div>

            <div className="p-4 bg-[#121212] border border-[#262626]">
              <div className="text-[#C5A059] font-mono text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Industry Standards</span>
              </div>
              <p className="leading-relaxed font-light">
                Strict adherence to international food safety (HACCP), ASEAN Tourism Professionals competencies, and sanitation norms.
              </p>
            </div>

            <div className="p-4 bg-[#121212] border border-[#262626]">
              <div className="text-[#C5A059] font-mono text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Emerging Tech Synergy</span>
              </div>
              <p className="leading-relaxed font-light">
                Extending classical hospitality principles through modern digital workflows, creative technology, and interactive customer prototypes.
              </p>
            </div>
          </div>
        </div>

        {/* Core Coursework Areas */}
        <div className="mb-14">
          <div className="flex items-center gap-2 border-b border-[#262626] pb-3 mb-8">
            <BookOpen className="w-4 h-4 text-[#C5A059]" />
            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-[#C5A059]">
              Specialized Coursework Competencies
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courseworkPillars.map((course) => (
              <div 
                key={course.code}
                className="p-6 bg-[#161616] border border-[#262626] hover:border-[#C5A059]/50 transition-all duration-300 group"
              >
                <div className="text-[10px] font-mono text-[#666666] group-hover:text-[#C5A059] transition-colors mb-2">
                  {course.code}
                </div>
                <h4 className="text-base font-serif italic text-white mb-2 leading-snug">
                  {course.title}
                </h4>
                <p className="text-xs text-[#888888] font-light leading-relaxed">
                  {course.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Progression Timeline */}
        <div>
          <div className="flex items-center gap-2 border-b border-[#262626] pb-3 mb-8">
            <Award className="w-4 h-4 text-[#C5A059]" />
            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-[#C5A059]">
              Milestones & Academic Progression
            </h3>
          </div>

          <div className="space-y-4">
            {milestones.map((item, index) => (
              <div 
                key={index}
                className="p-6 bg-[#141414] border border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider mb-1">
                    {item.year}
                  </div>
                  <h4 className="text-base font-serif italic text-white mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#888888] font-light max-w-3xl leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#555555] shrink-0">
                  Verified Academic Milestone
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
