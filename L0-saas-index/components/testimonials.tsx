import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "L0's persistent memory service transformed how we manage sensitive financial data. Zero cloud transmission means we actually sleep at night. The latency improvements are a bonus.",
      name: "Sarah Chen",
      title: "CTO, Global Financial Services",
      avatar: "SC",
    },
    {
      quote:
        "We deployed L0 in air-gapped environments for government operations. Finally, enterprise-grade AI reasoning without cloud dependencies. Cost savings alone justify the migration.",
      name: "Michael Johnson",
      title: "IT Director, Federal Agency",
      avatar: "MJ",
    },
    {
      quote:
        "The zero per-inference cost model is a game-changer. We scaled to millions of edge devices without touching cloud billing. ROI was immediate.",
      name: "David Rodriguez",
      title: "Head of Innovation, Enterprise Tech",
      avatar: "DR",
    },
  ]

  return (
    <section className="py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground mb-2">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Trusted by Leading Organizations
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              See what enterprise and government clients have to say about edge reasoning with L0.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full flex flex-col">
              <CardContent className="pt-6 flex-grow">
                <div className="mb-4 text-4xl">"</div>
                <p className="italic text-muted-foreground">{testimonial.quote}</p>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
