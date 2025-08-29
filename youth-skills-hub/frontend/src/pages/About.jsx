import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const About = () => {
  const { user } = useAuth()

  const stats = [
    { label: 'Students Empowered', value: '10,000+', icon: '👥' },
    { label: 'Courses Available', value: '50+', icon: '📚' },
    { label: 'Expert Mentors', value: '200+', icon: '👨‍🏫' },
    { label: 'Success Rate', value: '95%', icon: '🎯' }
  ]

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      bio: 'Former tech executive passionate about youth education and skills development.',
      image: '👩‍💼'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Education',
      bio: 'Experienced educator with 15+ years in curriculum development and teaching.',
      image: '👨‍🏫'
    },
    {
      name: 'Amara Nkosi',
      role: 'Community Manager',
      bio: 'Youth advocate dedicated to creating inclusive learning environments.',
      image: '👩‍💻'
    },
    {
      name: 'David Thompson',
      role: 'Technical Director',
      bio: 'Full-stack developer and AI enthusiast building the future of education.',
      image: '👨‍💻'
    }
  ]

  const values = [
    {
      title: 'Accessibility',
      description: 'Making quality education accessible to all South African youth, regardless of their background or location.',
      icon: '🌍'
    },
    {
      title: 'Innovation',
      description: 'Using cutting-edge technology and AI to create personalized learning experiences.',
      icon: '🚀'
    },
    {
      title: 'Community',
      description: 'Building a supportive community where learners can collaborate, share knowledge, and grow together.',
      icon: '🤝'
    },
    {
      title: 'Impact',
      description: 'Creating real change by equipping youth with skills that lead to meaningful employment and entrepreneurship.',
      icon: '💪'
    }
  ]

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <header className="border-b-2 border-green-400 p-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl text-pink-400 hover:text-cyan-400">Youth Skills Hub</Link>
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-cyan-400">Welcome, {user.username}!</span>
              <Link
                to="/dashboard"
                className="bg-green-400 text-black px-4 py-2 border-2 border-green-400 hover:bg-black hover:text-green-400"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <Link
              to="/"
              className="bg-green-400 text-black px-4 py-2 border-2 border-green-400 hover:bg-black hover:text-green-400"
            >
              Login / Register
            </Link>
          )}
        </div>
        <nav className="mt-2">
          <Link to="/" className="mr-4 hover:text-pink-400">Home</Link>
          <Link to="/courses" className="mr-4 hover:text-pink-400">Courses</Link>
          <Link to="/mentorship" className="mr-4 hover:text-pink-400">Mentorship</Link>
          <Link to="/study-groups" className="mr-4 hover:text-pink-400">Groups</Link>
          <span className="text-cyan-400">About</span>
        </nav>
      </header>

      <main className="p-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl text-cyan-400 mb-4">About Youth Skills Hub</h1>
          <p className="text-xl text-yellow-400 mb-6">Empowering South Africa's Youth Through Technology</p>
          <p className="max-w-3xl mx-auto text-lg">
            We're on a mission to bridge the skills gap in South Africa by providing accessible,
            high-quality education and mentorship opportunities to youth. Our platform combines
            traditional learning with modern technology to create an engaging, effective learning experience.
          </p>
        </section>

        {/* Stats Section */}
        <section className="mb-12">
          <h2 className="text-3xl text-pink-400 mb-8 text-center">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="border border-green-400 p-6 text-center">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-2xl text-cyan-400 font-bold mb-1">{stat.value}</div>
                <div className="text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission Section */}
        <section className="mb-12">
          <h2 className="text-3xl text-yellow-400 mb-6 text-center">Our Mission</h2>
          <div className="border border-green-400 p-8">
            <p className="text-lg leading-relaxed mb-6">
              South Africa faces a significant youth unemployment crisis, with over 60% of young people
              struggling to find meaningful employment. Traditional education systems often fail to provide
              the practical, industry-relevant skills that employers are looking for.
            </p>
            <p className="text-lg leading-relaxed mb-6">
              Youth Skills Hub was founded to address this gap by creating a comprehensive platform that
              combines quality education, mentorship, and community support. We believe that by equipping
              young people with in-demand digital skills and connecting them with industry professionals,
              we can significantly improve their employment prospects and contribute to economic growth.
            </p>
            <p className="text-lg leading-relaxed">
              Our approach is holistic – we don't just teach technical skills, we also focus on soft skills,
              career development, and building a supportive community that fosters growth and collaboration.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-12">
          <h2 className="text-3xl text-purple-400 mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div key={index} className="border border-green-400 p-6">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-4">{value.icon}</span>
                  <h3 className="text-xl text-cyan-400">{value.title}</h3>
                </div>
                <p className="text-green-400">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-12">
          <h2 className="text-3xl text-orange-400 mb-8 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {team.map((member, index) => (
              <div key={index} className="border border-green-400 p-6">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4">{member.image}</span>
                  <div>
                    <h3 className="text-xl text-cyan-400">{member.name}</h3>
                    <p className="text-yellow-400">{member.role}</p>
                  </div>
                </div>
                <p className="text-green-400">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center border-t border-green-400 pt-8">
          <h2 className="text-3xl text-pink-400 mb-4">Join Our Mission</h2>
          <p className="text-lg mb-6">
            Whether you're a student looking to learn new skills, a mentor wanting to give back,
            or an organization interested in partnering with us, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user && (
              <Link
                to="/"
                className="bg-green-400 text-black px-6 py-3 border-2 border-green-400 hover:bg-black hover:text-green-400"
              >
                Get Started as a Student
              </Link>
            )}
            <Link
              to="/mentorship"
              className="bg-purple-600 text-white px-6 py-3 border-2 border-purple-600 hover:bg-black hover:text-purple-400"
            >
              Become a Mentor
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-green-400 p-4 text-center">
        <p>&copy; 2025 Youth Skills Hub. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default About
