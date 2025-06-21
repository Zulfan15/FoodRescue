import { UserPlus, MapPin, Gift, CheckCircle } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: 'Sign Up',
      description: 'Create your account as a donor or recipient. Complete your profile with location information.',
      color: 'bg-blue-500'
    },
    {
      icon: MapPin,
      title: 'Find or Post',
      description: 'Donors post available food, recipients browse nearby donations on our interactive map.',
      color: 'bg-green-500'
    },
    {
      icon: Gift,
      title: 'Connect',
      description: 'Get matched with nearby users. Our system finds the best matches within your 5km radius.',
      color: 'bg-orange-500'
    },
    {
      icon: CheckCircle,
      title: 'Exchange',
      description: 'Coordinate pickup safely. Admin verification ensures quality and builds trust.',
      color: 'bg-purple-500'
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How FoodRescue Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our simple 4-step process makes food rescue easy, safe, and efficient for everyone involved.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-primary-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Make a Difference?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of users who are already making their communities better through food rescue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Get Started as Donor
              </button>
              <button className="border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Get Started as Recipient
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
