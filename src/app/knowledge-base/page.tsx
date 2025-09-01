
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const articles = [
  {
    category: "Anxiety",
    title: "Understanding and Managing Anxiety",
    content: "Anxiety is a normal human emotion, but it can become overwhelming. This article explores the causes of anxiety and provides practical tips for managing it, such as mindfulness, deep breathing exercises, and cognitive-behavioral techniques.",
  },
  {
    category: "Anxiety",
    title: "Coping with Panic Attacks",
    content: "Panic attacks can be frightening. Learn to recognize the signs of a panic attack and discover effective strategies to cope during and after an episode. Grounding techniques and professional help options are also discussed.",
  },
  {
    category: "Stress",
    title: "Effective Stress Management Techniques",
    content: "Stress is a part of life, but chronic stress can harm your health. This guide covers various stress management techniques, including time management, physical activity, and relaxation practices like yoga and meditation.",
  },
  {
    category: "Stress",
    title: "The Link Between Stress and Sleep",
    content: "Poor sleep and high stress levels often go hand-in-hand. This article explains how stress affects your sleep cycle and offers tips for improving your sleep hygiene to better manage stress.",
  },
  {
    category: "Self-Care",
    title: "The Importance of a Self-Care Routine",
    content: "Self-care is crucial for mental and emotional well-being. Discover why a consistent self-care routine is important and get ideas for creating a personalized plan that fits your lifestyle and needs.",
  },
  {
    category: "Self-Care",
    title: "Mindfulness for Beginners",
    content: "Mindfulness is the practice of being present in the moment. This beginner's guide introduces you to the basics of mindfulness and provides simple exercises to help you incorporate it into your daily life.",
  },
];


export default function KnowledgeBasePage() {
  const articlesByCategory = articles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, typeof articles>);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Explore articles and resources to learn more about mental health and well-being.
        </p>
      </div>

       <div className="max-w-lg mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search articles..." className="pl-10" />
          </div>
        </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(articlesByCategory).map(([category, articles]) => (
            <Card key={category}>
                <CardHeader>
                    <CardTitle>{category}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {articles.map(article => (
                            <AccordionItem key={article.title} value={article.title}>
                                <AccordionTrigger>{article.title}</AccordionTrigger>
                                <AccordionContent>
                                    {article.content}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
