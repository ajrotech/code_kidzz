// Central content + config for CodeKidzz.
// CONTACT below is the single place to update real details before launch.

// Theme-matched illustrations, stored locally in /public/images so the site never
// depends on an external host. To upgrade to real photography: download a stock photo
// (Pexels/Unsplash, free for commercial use) and save it over the matching file below
// (e.g. replace public/images/hero.svg with hero.jpg and update the extension here).
export const IMAGES = {
  hero: '/images/hero.svg', // suggested real photo: "kid coding laptop"
  camps: '/images/camps.svg', // suggested real photo: "kids robotics stem camp"
  classes: '/images/classes.svg', // suggested real photo: "child online class laptop"
  schools: '/images/schools.svg', // suggested real photo: "classroom technology"
  parents: '/images/parents.svg', // suggested real photo: "parent child laptop"
  kids: '/images/kids.svg', // suggested real photo: "kids building robot"
  videoThumb: '/images/video-thumb.svg', // suggested real photo/video: "kids coding class"
};

export const VIDEOS = {
  demo: new URL('./project-videos/demo.mp4', import.meta.url).href,
  catchGame: new URL('./project-videos/catch-game.mp4', import.meta.url).href,
  dinoGame: new URL('./project-videos/dino-game.mp4', import.meta.url).href,
  eidSpecial: new URL('./project-videos/eid-special.mp4', import.meta.url).href,
  timeTraveller: new URL('./project-videos/time-traveller.mp4', import.meta.url).href,
} as const;

export const CONTACT = {
  brand: 'CodeKidzz',
  tagline: 'Future-ready skills, one project at a time.',
  email: 'hello@codekidzz.com',
  phone: '+92 300 0000000',
  whatsappNumber: '923000000000', // digits only, no + or spaces
  address: 'Add your studio / HQ address here',
  timezone: 'Asia/Karachi',
  social: {
    instagram: '#',
    youtube: '#',
    facebook: '#',
    linkedin: '#',
  },
};

export const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  { label: 'Enroll', to: '/enroll' },
  { label: 'Contact', to: '/contact' },
];

// The two paths offered from the homepage hero.
export const programFormats = [
  {
    key: 'camps',
    title: 'STEM Camps',
    blurb: 'Short, intensive camps led by certified instructors.',
    cta: 'Explore Camps',
    to: '/services?format=camps',
  },
  {
    key: 'classes',
    title: 'Personalized STEM Classes',
    blurb: 'Ongoing weekly classes, matched to your child\'s pace.',
    cta: 'Explore Classes',
    to: '/services?format=classes',
  },
];

export type Pillar = 'coding' | 'ai' | 'robotics' | 'adaptive';

export const pillars: { key: Pillar; label: string; blurb: string }[] = [
  { key: 'coding', label: 'Scratch Programming', blurb: 'Block-based coding, zero syntax frustration.' },
  { key: 'ai', label: 'Artificial Intelligence', blurb: 'Train models, build chatbots, learn AI ethics.' },
  { key: 'robotics', label: 'Robotics', blurb: 'Sensors, motors, code that moves.' },
  { key: 'adaptive', label: 'Adaptive Learning', blurb: 'Paced to what your child has mastered.' },
];

export interface Course {
  id: string;
  pillar: Pillar;
  title: string;
  duration: string;
  ages: string;
  price: number;
  format: 'camps' | 'classes' | 'both';
  outcomes: string[]; // short tags, not sentences
}

export const courses: Course[] = [
  {
    id: 'scratch-coding',
    pillar: 'coding',
    title: 'Game Dev with Scratch',
    duration: '8 weeks',
    ages: '6-10',
    price: 49,
    format: 'both',
    outcomes: ['4 playable games', 'Loops & events', 'Demo day showcase'],
  },
  {
    id: 'ai-for-kidz',
    pillar: 'ai',
    title: 'AI for Kidz',
    duration: '8 weeks',
    ages: '9-13',
    price: 59,
    format: 'classes',
    outcomes: ['Train an image AI', 'Build a chatbot', 'AI ethics basics'],
  },
  {
    id: 'robotics-lab',
    pillar: 'robotics',
    title: 'Robotics & Programming',
    duration: '10 weeks',
    ages: '10-14',
    price: 79,
    format: 'both',
    outcomes: ['Build a real robot', 'Sensors & motors', 'Class challenge'],
  },
  {
    id: 'adaptive-pathway',
    pillar: 'adaptive',
    title: 'Adaptive Learning Pathway',
    duration: 'Ongoing',
    ages: '7-15',
    price: 69,
    format: 'classes',
    outcomes: ['Personal roadmap', 'Monthly reports', 'Flexible pace'],
  },
];

// "How it works" — icon + short label, no sentences.
export const howItWorks = [
  { icon: 'clock', label: '1 class / week', sub: '1.5 hours' },
  { icon: 'users', label: 'Ages 6-16', sub: 'grouped by level' },
  { icon: 'ratio', label: '7:1 ratio', sub: 'teacher to student' },
  { icon: 'monitor', label: 'Live online', sub: 'or in-person' },
  { icon: 'video', label: 'Google Meet', sub: 'or on-site studio' },
  { icon: 'doc', label: '24/7 access', sub: 'to class materials' },
];

export type ProjectIconKey = 'balloon' | 'maze' | 'ball' | 'quiz' | 'animation' | 'robot';

export interface Project {
  id: string;
  title: string;
  pillar: Pillar;
  icon: ProjectIconKey;
  skills: string[];
}

export const projects: Project[] = [
  { id: 'balloon-pop', title: 'Balloon Pop Game', pillar: 'coding', icon: 'balloon', skills: ['Events', 'Score tracking'] },
  { id: 'maze-runner', title: 'Maze Runner', pillar: 'coding', icon: 'maze', skills: ['Coordinates', 'Collisions'] },
  { id: 'quiz-game', title: 'Quiz Game', pillar: 'coding', icon: 'quiz', skills: ['Lists', 'Custom blocks'] },
  { id: 'trash-sorter', title: 'Trash Sorter AI', pillar: 'ai', icon: 'animation', skills: ['Image AI', 'Data labeling'] },
  { id: 'line-follower', title: 'Line-Following Robot', pillar: 'robotics', icon: 'robot', skills: ['Sensors', 'Motor control'] },
];

export interface ProjectVideo {
  id: string;
  title: string;
  pillar: Pillar;
  description: string;
  video: string;
}

export const projectVideos: ProjectVideo[] = [
  {
    id: 'catch-game-video',
    title: 'Catch the Ball',
    pillar: 'coding',
    description: 'A fast reflex game where kids move the catcher to score points.',
    video: VIDEOS.catchGame,
  },
  {
    id: 'dino-game-video',
    title: 'Dino Game',
    pillar: 'coding',
    description: 'An endless runner with jumps, obstacles, and level timing.',
    video: VIDEOS.dinoGame,
  },
  {
    id: 'time-traveller-video',
    title: 'Time Traveller',
    pillar: 'adaptive',
    description: 'A story-based adventure through different eras and mini challenges.',
    video: VIDEOS.timeTraveller,
  },
];

export const projectsComingSoon: Project[] = [
  { id: 'quiz-game', title: 'Quiz Game', pillar: 'coding', icon: 'quiz', skills: ['Lists', 'Custom blocks'] },
  { id: 'trash-sorter', title: 'Trash Sorter AI', pillar: 'ai', icon: 'animation', skills: ['Image AI', 'Data labeling'] },
  { id: 'line-follower', title: 'Line-Following Robot', pillar: 'robotics', icon: 'robot', skills: ['Sensors', 'Motor control'] },
];

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

export const testimonials: Testimonial[] = [
  { name: 'Ayesha K.', role: 'Parent', quote: 'My daughter built her own game in weeks. Demo day was the proudest I\'ve seen her.' },
  { name: 'Bilal R.', role: 'Age 11, Robotics', quote: 'I built a robot that follows a line on the floor. Want to build a bigger one now.' },
  { name: 'Ms. Fatima N.', role: 'Partner school', quote: 'Our after-school club filled up faster than any program we\'ve run.' },
];

export const audiences = [
  { key: 'parents', title: 'Parents', description: 'Screen time that builds something real.', image: IMAGES.parents },
  { key: 'kids', title: 'Kids', description: 'Build games, train AI, program robots.', image: IMAGES.kids },
  { key: 'schools', title: 'Schools', description: 'A ready-to-run STEAM curriculum.', image: IMAGES.schools, to: '/demo' },
];

export const stats = [
  { value: '4', label: 'Skill tracks' },
  { value: '6-16', label: 'Ages' },
  { value: '7:1', label: 'Student ratio' },
  { value: '100%', label: 'Project-based' },
];

export const faqs = [
  { question: 'Does my child need experience?', answer: 'No — courses start from zero, grouped by age and skill.' },
  { question: 'What do we need at home?', answer: 'A laptop or desktop. Robotics kits are provided.' },
  { question: 'Do you work with schools?', answer: 'Yes — request a demo and we\'ll walk your team through it.' },
  { question: 'Can we try a class first?', answer: 'Yes, ask about a free trial class when you enroll.' },
];
