import React from 'react';
import { ScrollAnimation } from '../../../shared/components/utils/ScrollAnimation';

interface Testimonial {
  name: string;
  location?: string;
  rating: number;
  content: string;
  image?: string;
}

interface DockHubTestimonialsProps {
  data: {
    title: string;
    subtitle?: string;
    testimonials: Testimonial[];
  };
}

const DockHubTestimonials: React.FC<DockHubTestimonialsProps> = ({ data }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-primary' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollAnimation animation="fade-in-up" className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-background">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-lg text-gray-600">
              {data.subtitle}
            </p>
          )}
        </ScrollAnimation>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.testimonials.map((testimonial, index) => (
            <ScrollAnimation
              key={index}
              animation="fade-in-up"
              delay={index * 150}
              className="group"
            >
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                {/* Rating Stars */}
                <div className="text-xl mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Quote */}
                <p className="text-gray-700 italic mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center">
                  {testimonial.image ? (
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 bg-gray-300"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full mr-4 bg-primary flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-background">
                      {testimonial.name}
                    </p>
                    {testimonial.location && (
                      <p className="text-sm text-gray-500">
                        {testimonial.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DockHubTestimonials;