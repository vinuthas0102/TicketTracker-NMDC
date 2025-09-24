import React from 'react';
import { ArrowRight, CheckCircle, Users, Shield, Zap, BarChart3, Clock, FileText, Star, Quote } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: Users,
      title: 'Role-Based Access Control',
      description: 'Secure access with Employee, Department Officer, and Executive Officer roles'
    },
    {
      icon: CheckCircle,
      title: 'Complete Ticket Lifecycle',
      description: 'From draft to completion with proper status transitions and approvals'
    },
    {
      icon: BarChart3,
      title: 'Advanced Step Management',
      description: 'Hierarchical steps with dependencies, parallel execution, and progress tracking'
    },
    {
      icon: Shield,
      title: 'Audit Trail',
      description: 'Complete history of all changes with user tracking and timestamps'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Instant notifications and live data synchronization across all users'
    },
    {
      icon: Clock,
      title: 'Due Date Management',
      description: 'Track deadlines with overdue alerts and priority-based organization'
    }
  ];

  const modules = [
    {
      name: 'Maintenance Tracker',
      description: 'Track and manage maintenance requests and work orders',
      icon: '🔧',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      name: 'Maintenance Tracker',
      description: 'Track and manage maintenance requests and work orders',
      icon: '⚠️',
      color: 'from-red-500 to-pink-500'
    },
    {
      name: 'Complaints Tracker',
      description: 'Manage customer complaints and resolution workflows',
      icon: '👥',
      color: 'from-orange-500 to-red-500'
    },
    {
      name: 'Grievances Management',
      description: 'Handle employee grievances and HR processes',
      icon: '📄',
      color: 'from-green-500 to-teal-500'
    },
    {
      name: 'RTI Tracker',
      description: 'Right to Information request tracking and management',
      icon: '💼',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      name: 'Project Execution Platform',
      description: 'Track project milestones and deliverables',
      icon: '🏢',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Department Manager',
      company: 'TechCorp Solutions',
      quote: 'This system has revolutionized how we handle internal requests. The hierarchical step management is exactly what we needed.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Executive Officer',
      company: 'Global Industries',
      quote: 'The audit trail and role-based access give us complete visibility and control. Outstanding platform!',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'HR Director',
      company: 'Innovation Labs',
      quote: 'Managing grievances and complaints has never been easier. The workflow automation saves us hours every week.',
      rating: 5
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Tickets Processed' },
    { number: '500+', label: 'Organizations' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white bg-opacity-90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">TT</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Ticket Tracker
              </span>
            </div>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
            Streamline Your
            <br />
            Workflow Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            A comprehensive, production-ready ticket tracking system with role-based access control, 
            advanced step management, and complete audit trails. Built for modern organizations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center space-x-2 text-lg font-semibold"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="text-gray-600 hover:text-gray-800 px-8 py-4 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 text-lg font-semibold">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white bg-opacity-60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage tickets efficiently and securely
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white border-opacity-50"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white bg-opacity-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Multiple Modules
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from specialized modules designed for different organizational needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${module.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
              >
                <div className="text-4xl mb-4">{module.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{module.name}</h3>
                <p className="text-white text-opacity-90 leading-relaxed">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trusted by organizations worldwide for their workflow management needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white border-opacity-50"
              >
                <div className="flex items-center mb-4">
                  <Quote className="w-8 h-8 text-blue-500 mr-2" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4 italic leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-800">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-blue-600">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of organizations already using our platform to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center space-x-2 text-lg font-semibold"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="text-white hover:text-blue-100 px-8 py-4 rounded-xl border-2 border-white border-opacity-50 hover:border-opacity-75 transition-all duration-200 text-lg font-semibold">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">TT</span>
                </div>
                <span className="text-lg font-bold">Ticket Tracker</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Streamline your workflow management with our comprehensive ticket tracking system.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Modules</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Ticket Tracker. All rights reserved. Built with ❤️ for modern organizations.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;