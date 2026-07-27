import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { projects, pillars, IMAGES, VIDEOS, projectVideos, type ProjectIconKey } from '../data';
import { BalloonPopIcon, MazeGameIcon, CatchBallIcon, QuizGameIcon, AnimationIcon, RobotIcon } from '../components/ProjectIcons';
import { VideoPlaceholder } from '../components/Illustrations';
import { Reveal } from '../components/Reveal';

const projectIcons: Record<ProjectIconKey, () => ReactElement> = {
  balloon: BalloonPopIcon,
  maze: MazeGameIcon,
  ball: CatchBallIcon,
  quiz: QuizGameIcon,
  animation: AnimationIcon,
  robot: RobotIcon,
};

function ProjectsPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="page">
      <section className="section page-intro project-page-intro">
        <span className="eyebrow">Games & Builds</span>
        <h1>What Kids Actually Build Here</h1>
      </section>

      <Reveal>
        <section className="section">
          <div className="section-heading center">
            <span className="eyebrow">Watch</span>
            <h2>See a Class in Action</h2>
          </div>
          <VideoPlaceholder label="Eid Special showcase" image={IMAGES.videoThumb} src={VIDEOS.eidSpecial} />
        </section>
      </Reveal>

      
      <Reveal>
        <section className="section project-grid">
          {projectVideos.map((projectVideo) => {
            const pillarLabel = pillars.find((p) => p.key === projectVideo.pillar)?.label ?? projectVideo.pillar;

            return (
              <article className="project-card project-card--video" key={projectVideo.id}>
                <div className={`project-thumb pillar-${projectVideo.pillar}`}>
                  <video
                    className="project-thumb-video"
                    src={projectVideo.video}
                    poster={IMAGES.videoThumb}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={projectVideo.title}
                  />
                  <span className="project-badge">{pillarLabel}</span>
                </div>

                <h2>{projectVideo.title}</h2>
                <p className="project-description">{projectVideo.description}</p>
              </article>
            );
          })}
        </section>
      </Reveal>
    </div>
  );
}

export default ProjectsPage;
