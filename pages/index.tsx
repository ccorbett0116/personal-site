import { motion } from 'framer-motion';
import Head from 'next/head';

const heroVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  return (
    <>
      <Head>
        <title>Cole Corbett | AI & Optimization MSc Student</title>
        <meta
          name="description"
          content="Master’s student in AI & Optimization building scalable, data-driven solutions."
        />
      </Head>

      <motion.main
        initial="hidden"
        animate="visible"
        className="bg-white text-gray-800"
      >
        {/* Hero Section */}
        <motion.section
          variants={heroVariants}
          transition={{ duration: 0.8 }}
          className="min-h-screen flex flex-col justify-center items-center px-6"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-center">
            Cole Corbett
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 text-center">
            AI & Optimization MSc Student
          </p>
        </motion.section>

        {/* About Section */}
        <section className="py-16 px-6 bg-gray-50">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-4">About Me</h2>
            <p className="text-gray-600">
              I’m Cole Corbett, a Master's student based in Toronto focusing on
              artificial intelligence and optimization. I design and implement
              data-driven algorithms to solve complex real-world problems.
            </p>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Cole Corbett. All rights reserved.
        </footer>
      </motion.main>
    </>
  );
}
