import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { courses, type Pillar } from '../data';
import { CreativeCodingIcon, AIIcon, AdaptiveLearningIcon, RoboticsIcon } from '../components/CourseIcons';

const courseIcons: Record<Pillar, () => ReactElement> = {
  coding: CreativeCodingIcon,
  ai: AIIcon,
  robotics: RoboticsIcon,
  adaptive: AdaptiveLearningIcon,
};

function CoursesPage() {
  return (
    <div className="page">
      <section className="section page-intro">
        <span className="eyebrow">Courses</span>
        <h1>Four Skills. One Confident Kid.</h1>
        <p>Every course is project-based, small-group, and taught by real instructors — no passive videos, no fixed pace that leaves anyone behind.</p>
      </section>

      <section className="section course-list">
        {courses.map((course) => {
          const IconComponent = courseIcons[course.pillar];
          return (
            <article className="course-card" key={course.id}>
              <div className="course-svg-icon">
                <IconComponent />
              </div>
              <div className="course-meta">
                <span className="course-level">Ages {course.ages}</span>
                <span className="course-duration">⏱️ {course.duration}</span>
              </div>
              <h2>{course.title}</h2>
              <ul className="skills-list">
                {course.outcomes.map((outcome) => (
                  <li key={outcome}>✨ {outcome}</li>
                ))}
              </ul>
              <div className="course-footer">
                <span className="price">${course.price}<span className="price-period">/mo</span></span>
                <Link className="primary-btn small" to={`/enroll?course=${course.id}`}>Enroll Now →</Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

export default CoursesPage;
