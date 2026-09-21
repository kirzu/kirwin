/**
 * Static fallback for the three original testimonials. These are merged with
 * any BlogPost testimonials stored in the database so the public page always
 * shows the original stories even before the production database is seeded.
 * Database entries with matching slugs take precedence, which lets the admin
 * edit them later through the CMS.
 */

export type StaticTestimonial = {
  id: string;
  slug: string;
  title: string;
  content: string;
  rating: number;
  youtubeUrl: string;
  imageUrl: string | null;
};

export const ORIGINAL_TESTIMONIALS: StaticTestimonial[] = [
  {
    id: "static-alex",
    slug: "alex",
    title: "Alex",
    content:
      "Stephen has become more of a ritual to me every time I do a big race",
    rating: 5,
    youtubeUrl: "https://www.youtube.com/watch?v=v_jcsCvFKcA",
    imageUrl: "/assets/testimonial-alex.jpg",
  },
  {
    id: "static-walter",
    slug: "walter",
    title: "Walter",
    content:
      "Stephen basically saved my life as well as thousands of dollars as a professional football player",
    rating: 5,
    youtubeUrl: "https://www.youtube.com/watch?v=1WcwkXCm9as",
    imageUrl: "/assets/testimonial-walter.jpg",
  },
  {
    id: "static-danielle",
    slug: "danielle",
    title: "Danielle",
    content:
      "While I was living back In England I attended many appointments and sadly nobody compared to what Stephen was able to do in just one session",
    rating: 5,
    youtubeUrl: "https://www.youtube.com/watch?v=GvfGYG6xotw",
    imageUrl: "/assets/testimonial-danielle.jpg",
  },
  {
    id: "static-teresa",
    slug: "teresa-young",
    title: "Teresa Young",
    content:
      "His approach to bodywork is highly intuitive and uses a variety of techniques and makes me completely comfortable",
    rating: 5,
    youtubeUrl: "https://www.youtube.com/shorts/yleywQGhYrY",
    imageUrl: "https://img.youtube.com/vi/yleywQGhYrY/maxresdefault.jpg",
  },
];
