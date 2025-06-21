import { TrendingUp, Users, MapPin, Award } from 'lucide-react'

export function Statistics() {
  const stats = [
    {
      icon: TrendingUp,
      value: '25,000+',
      label: 'Meals Saved',
      description: 'Food items rescued from waste'
    },
    {
      icon: Users,
      value: '8,500+',
      label: 'Active Users',
      description: 'Donors and recipients combined'
    },
    {
      icon: MapPin,
      value: '150+',
      label: 'Cities',
      description: 'Locations where FoodRescue operates'
    },
    {
      icon: Award,
      value: '95%',
      label: 'Success Rate',
      description: 'Successful food donations completed'
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Together, we're making a real difference in our communities by reducing food waste 
            and helping those in need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-xl font-semibold mb-2">
                  {stat.label}
                </div>
                <div className="text-primary-200 text-sm">
                  {stat.description}
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Be Part of the Solution
          </h3>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join our growing community and help us reach our goal of rescuing 100,000 meals this year.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Donating Today
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
