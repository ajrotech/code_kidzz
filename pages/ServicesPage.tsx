import { useMemo, useState, type ReactElement } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { courses, IMAGES, type Pillar } from '../data';
import { CreativeCodingIcon, AIIcon, AdaptiveLearningIcon, RoboticsIcon } from '../components/CourseIcons';
import { Reveal } from '../components/Reveal';

const courseIcons: Record<Pillar, () => ReactElement> = {
  coding: CreativeCodingIcon,
  ai: AIIcon,
  robotics: RoboticsIcon,
  adaptive: AdaptiveLearningIcon,
};

type FormatFilter = 'all' | 'camps' | 'classes';

const categoryShowcase: { key: FormatFilter; title: string; blurb: string; image: string }[] = [
  { key: 'camps', title: 'STEM Camps', blurb: 'Short, intensive camps led by certified instructors.', image: IMAGES.camps },
  { key: 'classes', title: 'Personalized Classes', blurb: 'Ongoing weekly classes, matched to your pace.', image: IMAGES.classes },
];

function CourseCard({ course }: { course: (typeof courses)[number] }) {
  const Icon = courseIcons[course.pillar];
  return (
    <article className="module-card">
      <div className={`module-badge pillar-${course.pillar}`}>
        <Icon />
      </div>
      <h3>{course.title}</h3>
      <span className="duration-tag">{course.duration} • Ages {course.ages}</span>
      <div className="tag-row">
        {course.outcomes.map((tag) => <span className="tag-pill" key={tag}>{tag}</span>)}
      </div>
      <div className="center-cta">
        <Link className="primary-btn small" to={`/enroll?course=${course.id}`}>Enroll →</Link>
      </div>
    </article>
  );
}

function ServicesPage() {
  const [searchParams] = useSearchParams();
  const initialFormat = searchParams.get('format');
  const [filter, setFilter] = useState<FormatFilter>(
    initialFormat === 'camps' || initialFormat === 'classes' ? initialFormat : 'all',
  );

  const visibleCourses = useMemo(
    () => courses.filter((c) => filter === 'all' || c.format === filter || c.format === 'both'),
    [filter],
  );

  return (
    <div className="page">
      <section className="section page-intro">
        <span className="eyebrow">Services</span>
        <h1>Everything We Offer, In One Place</h1>
        <p>STEM Camps and personalized classes for every learning style.</p>
      </section>

      <Reveal>
        <section className="section">
          <div className="program-choice-grid">
            {categoryShowcase.map((category) => (
              <button
                key={category.key}
                type="button"
                className={`program-choice-card choice-${category.key}`}
                onClick={() => setFilter(category.key)}
                style={{ backgroundImage: `linear-gradient(rgba(30,27,75,0.55), rgba(30,27,75,0.72)), url(${category.image})` }}
              >
                <h2>{category.title}</h2>
                <p>{category.blurb}</p>
                <span className="pill-btn">View {category.title} →</span>
              </button>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section">
          <div className="filter-row">
            <button className={filter === 'all' ? 'chip active' : 'chip'} onClick={() => setFilter('all')}>All</button>
            <button className={filter === 'camps' ? 'chip active' : 'chip'} onClick={() => setFilter('camps')}>STEM Camps</button>
            <button className={filter === 'classes' ? 'chip active' : 'chip'} onClick={() => setFilter('classes')}>Personalized Classes</button>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section module-grid">
          {visibleCourses.map((course) => <CourseCard course={course} key={course.id} />)}
        </section>
      </Reveal>
    </div>
  );
}

export default ServicesPage;
