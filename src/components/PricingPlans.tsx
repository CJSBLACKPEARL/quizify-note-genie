
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap, Crown, Gift } from 'lucide-react';

interface PricingPlansProps {
  onSelectPlan: (plan: string) => void;
}

const PricingPlans = ({ onSelectPlan }: PricingPlansProps) => {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for getting started",
      wordLimit: "Up to 500 words",
      icon: <Gift className="h-6 w-6" />,
      features: [
        "Up to 500 words per quiz",
        "Basic quiz generation",
        "Limited quiz history",
        "Standard support"
      ],
      buttonText: "Start Free",
      popular: false,
      gradient: "from-gray-600 to-gray-700"
    },
    {
      name: "Student",
      price: "₹99",
      period: "per month",
      description: "Ideal for regular studying",
      wordLimit: "Up to 2000 words",
      icon: <Zap className="h-6 w-6" />,
      features: [
        "Up to 2000 words per quiz",
        "Advanced AI generation",
        "Full quiz history",
        "Performance analytics",
        "Priority support"
      ],
      buttonText: "Choose Student",
      popular: true,
      gradient: "from-purple-600 to-blue-600"
    },
    {
      name: "Premium",
      price: "₹199",
      period: "per month",
      description: "For serious learners",
      wordLimit: "Unlimited words",
      icon: <Crown className="h-6 w-6" />,
      features: [
        "Unlimited words per quiz",
        "Premium AI algorithms",
        "Unlimited quiz history",
        "Advanced analytics",
        "Custom quiz types",
        "24/7 premium support"
      ],
      buttonText: "Go Premium",
      popular: false,
      gradient: "from-yellow-500 to-orange-600"
    }
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Select the perfect plan for your learning needs. Upgrade or downgrade at any time.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative bg-gray-800 border-gray-700 hover:border-purple-500 transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center mx-auto mb-4 text-white`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">/{plan.period}</span>
                </div>
                <div className="text-purple-400 font-semibold mt-2">{plan.wordLimit}</div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => onSelectPlan(plan.name.toLowerCase())}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  } text-white`}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
