import { PrismaClient, Role, BookingStatus, PaymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Admin user -------------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me-in-production";
  const adminName = process.env.ADMIN_NAME ?? "Site Administrator";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      // Only refresh the hash if it looks like a fresh seed run; in a real
      // environment you would not overwrite this on every `db seed` call.
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log(`[seed] admin user ready: ${admin.email} (${admin.role})`);

  // --- Sample course ----------------------------------------------------
  const sampleSlug = "intro-to-myofascial-release";

  const sampleCourse = await prisma.course.upsert({
    where: { slug: sampleSlug },
    update: {},
    create: {
      slug: sampleSlug,
      title: "Introduction to Myofascial Release",
      titleZh: "肌筋膜放鬆入門",
      description:
        "A hands-on introduction to myofascial release techniques for bodyworkers and movement practitioners.",
      descriptionZh:
        "為身體工作者及動作治療師而設的肌筋膜放鬆技術實作入門工作坊。",
      price: 180000, // HKD $1,800.00
      durationMinutes: 240,
      maxParticipants: 8,
      published: true,
    },
  });

  console.log(`[seed] sample course ready: ${sampleCourse.slug}`);

  // --- Availability slot ------------------------------------------------
  const startDateTime = new Date();
  startDateTime.setUTCHours(10, 0, 0, 0);
  startDateTime.setUTCDate(startDateTime.getUTCDate() + 14);
  const endDateTime = new Date(
    startDateTime.getTime() + sampleCourse.durationMinutes! * 60_000,
  );

  await prisma.availability.upsert({
    where: {
      // Prisma doesn't support a composite unique we haven't declared,
      // so we target the single known seeded slot by its start time.
      id:
        (
          await prisma.availability.findFirst({
            where: { courseId: sampleCourse.id, startDateTime },
          })
        )?.id ?? "",
    },
    update: {
      endDateTime,
      capacity: sampleCourse.maxParticipants,
      bookedCount: 0,
      isAvailable: true,
    },
    create: {
      courseId: sampleCourse.id,
      startDateTime,
      endDateTime,
      capacity: sampleCourse.maxParticipants,
      bookedCount: 0,
      isAvailable: true,
    },
  });
  console.log(
    `[seed] sample availability slot ready for ${startDateTime.toISOString()}`,
  );

  // --- Testimonials ------------------------------------------------------
  // The BlogPost model is repurposed for testimonials (see D033 in the
  // kirwin-variety-refresh plan). Three seed entries capture the original
  // quotes, ratings, and YouTube links from the source site.
  const testimonials = [
    {
      slug: "alex",
      title: "Alex",
      titleZh: null,
      excerpt: null,
      excerptZh: null,
      content:
        "Stephen has become more of a ritual to me every time I do a big race",
      contentZh: null,
      rating: 5,
      youtubeUrl: "https://www.youtube.com/watch?v=v_jcsCvFKcA",
      imageUrl: "/assets/testimonial-alex.jpg",
      published: true,
    },
    {
      slug: "walter",
      title: "Walter",
      titleZh: null,
      excerpt: null,
      excerptZh: null,
      content:
        "Stephen basically saved my life as well as thousands of dollars as a professional football player",
      contentZh: null,
      rating: 5,
      youtubeUrl: "https://www.youtube.com/watch?v=1WcwkXCm9as",
      imageUrl: "/assets/testimonial-walter.jpg",
      published: true,
    },
    {
      slug: "danielle",
      title: "Danielle",
      titleZh: null,
      excerpt: null,
      excerptZh: null,
      content:
        "While I was living back In England I attended many appointments and sadly nobody compared to what Stephen was able to do in just one session",
      contentZh: null,
      rating: 5,
      youtubeUrl: "https://www.youtube.com/watch?v=GvfGYG6xotw",
      imageUrl: "/assets/testimonial-danielle.jpg",
      published: true,
    },
  ] as const;

  for (const testimonial of testimonials) {
    await prisma.blogPost.upsert({
      where: { slug: testimonial.slug },
      update: {
        title: testimonial.title,
        content: testimonial.content,
        rating: testimonial.rating,
        youtubeUrl: testimonial.youtubeUrl,
        imageUrl: testimonial.imageUrl,
        published: testimonial.published,
      },
      create: { ...testimonial },
    });
    console.log(`[seed] testimonial ready: ${testimonial.slug}`);
  }

  // --- Sanity references to enums (silence unused-import warnings if any) -
  void BookingStatus;
  void PaymentStatus;
}

main()
  .catch((err) => {
    console.error("[seed] failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
