import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, MessageCircle, Phone, Video } from "lucide-react";

const resources = [
  {
    title: "Crisis Text Line",
    description: "Connect with a crisis counselor for free, 24/7 support. Text HOME to 741741.",
    icon: MessageCircle,
    type: "Text",
    link: "https://www.crisistextline.org/",
  },
  {
    title: "The Trevor Project",
    description: "Support for LGBTQ young people in crisis, 24/7. Call, text, or chat.",
    icon: Phone,
    type: "Call/Text",
    link: "https://www.thetrevorproject.org/",
  },
  {
    title: "988 Suicide & Crisis Lifeline",
    description: "Free and confidential support for people in distress. Dial 988.",
    icon: Phone,
    type: "Call",
    link: "https://988lifeline.org/",
  },
  {
    title: "NAMI (National Alliance on Mental Illness)",
    description: "Find resources, support groups, and educational materials.",
    icon: Globe,
    type: "Website",
    link: "https://www.nami.org/",
  },
  {
      title: "Headspace: Mindful Meditation",
      description: "Guided meditations, articles, and videos to help with stress and anxiety.",
      icon: Video,
      type: "App/Website",
      link: "https://www.headspace.com/",
  },
  {
      title: "BetterHelp",
      description: "Online portal providing direct access to mental health professionals for therapy sessions.",
      icon: Globe,
      type: "Website",
      link: "https://www.betterhelp.com/",
  }
];

export default function ResourcesPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Mental Health Resources</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          If you are in immediate danger, please call 911. Here are some resources that can provide help and support.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <a key={resource.title} href={resource.link} target="_blank" rel="noopener noreferrer" className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg block h-full">
                <Card className="h-full hover:border-primary transition-colors hover:shadow-lg flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>{resource.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{resource.type}</p>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <CardDescription>{resource.description}</CardDescription>
                </CardContent>
                </Card>
            </a>
          );
        })}
      </div>
    </div>
  );
}
