import { MapPin, Users, Shield, Clock, Heart, Globe } from 'lucide-react'

export function Features() {
  const features = [
    {
      icon: MapPin,
      title: 'Location-Based Matching',
      description: 'Find food donations within a 5km radius using our interactive map feature.',
      color: 'text-blue-500'
    },
    {
      icon: Shield,
      title: 'Admin Verification',
      description: 'All food donations are verified by our admin team to ensure safety and quality.',
      color: 'text-green-500'
    },
    {
      icon: Clock,
      title: 'Real-Time Updates',
      description: 'Get instant notifications about new food donations and pickup confirmations.',
      color: 'text-orange-500'
    },
    {
      icon: Users,
      title: 'Community-Driven',
      description: 'Join a network of caring individuals making a difference in their communities.',
      color: 'text-purple-500'
    },
    {
      icon: Heart,
      title: 'Social Impact',
      description: 'Track your contribution to reducing food waste and helping those in need.',
      color: 'text-red-500'
    },
    {
      icon: Globe,
      title: 'Sustainability',
      description: 'Help create a more sustainable future by reducing food waste in your area.',
      color: 'text-teal-500'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose FoodRescue?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform combines cutting-edge technology with community spirit to create 
            an efficient and safe food rescue ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg bg-white shadow-sm ${feature.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
