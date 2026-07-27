import { useEffect, useRef, useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { audiences, courses, faqs, howItWorks, IMAGES, programFormats, projects, stats, VIDEOS, type Pillar } from '../data';
import { CreativeCodingIcon, AIIcon, RoboticsIcon, AdaptiveLearningIcon } from '../components/CourseIcons';
import { featureIconMap } from '../components/FeatureIcons';
import { VideoPlaceholder } from '../components/Illustrations';
import { Reveal } from '../components/Reveal';

const pillarIcons: Record<Pillar, () => ReactElement> = {
  coding: CreativeCodingIcon,
  ai: AIIcon,
  robotics: RoboticsIcon,
  adaptive: AdaptiveLearningIcon,
};

const romanNumerals = ['I', 'II', 'III', 'IV', 'V'];

function HomePage() {
  const animatedStatsRef = useRef<HTMLDivElement | null>(null);
  const [statsAnimated, setStatsAnimated] = useState(false);

  useEffect(() => {
    const node = animatedStatsRef.current;
    if (!node) return;

    const animate = () => {
      const els = Array.from(node.querySelectorAll<HTMLElement>('.stat-value'));
      els.forEach((el) => {
        const raw = el.dataset.target ?? el.textContent ?? '';
        const match = raw.match(/^(\d+)([^\d]*)$/);
        const targetNum = match ? parseInt(match[1], 10) : parseInt(raw.replace(/\D/g, ''), 10) || 0;
        const suffix = match ? match[2] : raw.replace(/\d/g, '') || '';
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / 1100);
          el.textContent = `${Math.floor(t * targetNum)}${suffix}`;
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !statsAnimated) {
          setStatsAnimated(true);
          animate();
        }
      });
    }, { threshold: 0.3 });

    io.observe(node);
    return () => io.disconnect();
  }, [statsAnimated]);

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Coding • AI • Robotics • Adaptive Learning</span>
          <h1>Future-Ready Skills, <span className="accent">Built by Doing</span></h1>
          <p>Live, project-based classes for kids 6-16 — in Scratch, AI, and Robotics.</p>
          <div className="hero-actions">
            <Link className="primary-btn" to="/enroll">Book Free Class</Link>
            <Link className="secondary-btn" to="/projects">See What Kids Build</Link>
          </div>
        </div>
        <div className="hero-visual">
          <img className="hero-photo" src={IMAGES.hero} alt="A child coding on a laptop" loading="eager" />
          <span className="floating-tag tag-1">Build games</span>
          <span className="floating-tag tag-2">Train an AI</span>
          <span className="floating-tag tag-3">Program a robot</span>
        </div>
      </section>

      <Reveal>
        <section className="section">
          <div className="program-choice-grid">
            {programFormats.map((program) => (
              <Link
                className={`program-choice-card choice-${program.key}`}
                to={program.to}
                key={program.key}
                style={{ backgroundImage: `linear-gradient(rgba(30,27,75,0.55), rgba(30,27,75,0.72)), url(${program.key === 'camps' ? IMAGES.camps : IMAGES.classes})` }}
              >
                <h2>{program.title}</h2>
                <p>{program.blurb}</p>
                <span className="pill-btn">{program.cta} →</span>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      

      <section className="section">
        <div className="section-heading center">
          <span className="eyebrow">How It Works</span>
        </div>
        <div className="how-it-works-grid">
          {howItWorks.map((item) => {
            const Icon = featureIconMap[item.icon as keyof typeof featureIconMap];
            return (
              <div className="how-it-works-item" key={item.label}>
                <Icon className="feature-icon" />
                <strong>{item.label}</strong>
                <span>{item.sub}</span>
              </div>
            );
          })}
        </div>
      </section>

      <Reveal>
        <section className="section">
          <div className="section-heading center">
            <span className="eyebrow">Courses</span>
            <h2>Pick a track, start building</h2>
          </div>
          <div className="module-grid">
            {courses.map((course, idx) => {
              const Icon = pillarIcons[course.pillar];
              return (
                <article className="module-card" key={course.id}>
                  <div className={`module-badge pillar-${course.pillar}`}>
                    <Icon />
                    <span className="module-number">{romanNumerals[idx]}</span>
                  </div>
                  <h3>{course.title}</h3>
                  <span className="duration-tag">{course.duration} • Ages {course.ages}</span>
                  <div className="tag-row">
                    {course.outcomes.map((tag) => (
                      <span className="tag-pill" key={tag}>{tag}</span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
          <div className="center-cta">
            <Link className="primary-btn" to="/services">See All Services</Link>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section audience-strip">
          {audiences.map((item) => (
            <Link className="audience-tile" to={item.to ?? '/enroll'} key={item.key}>
              <img src={item.image} alt="" className="audience-photo" />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </section>
      </Reveal>

      <section className="section split-layout">
        <div>
          <div className="section-heading">
            <span className="eyebrow">Student projects</span>
            <h2>Real things kids have built</h2>
          </div>
          <div className="project-stack">
            {projects.slice(0, 3).map((project) => (
              <article className="project-mini" key={project.id}>
                <strong>{project.title}</strong>
                <div className="tag-row">
                  {project.skills.map((skill) => <span className="tag-pill" key={skill}>{skill}</span>)}
                </div>
              </article>
            ))}
          </div>
          <Link className="secondary-btn small" to="/projects">See All Projects →</Link>
        </div>
        <VideoPlaceholder label="Demo class video" image={IMAGES.videoThumb} src={VIDEOS.demo} />
      </section>

      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to spark curiosity?</h2>
          <div className="hero-actions">
            <Link className="primary-btn large" to="/enroll">Book Free Class</Link>
            <Link className="secondary-btn large" to="/contact">Talk to Us</Link>
          </div>
        </div>
      </section>

      <section className="section faq-section">
        <div className="section-heading center">
          <span className="eyebrow">FAQ</span>
        </div>
        <div className="faq-grid">
          {faqs.map((faq) => (
            <details className="faq-card" key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
