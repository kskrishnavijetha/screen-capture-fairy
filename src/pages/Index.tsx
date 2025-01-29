import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const examCategories = [
    {
      title: "NEET",
      description: "National Eligibility cum Entrance Test for Medical Aspirants",
      subjects: ["Physics", "Chemistry", "Biology"],
      color: "bg-green-500/10"
    },
    {
      title: "IIT JEE",
      description: "Joint Entrance Examination for Engineering Aspirants",
      subjects: ["Physics", "Chemistry", "Mathematics"],
      color: "bg-blue-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Prepare for NEET & IIT JEE
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive preparation platform for India's top medical and engineering entrance exams
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {examCategories.map((exam) => (
            <Card key={exam.title} className={`${exam.color} border-none shadow-lg hover:scale-105 transition-transform`}>
              <CardHeader>
                <CardTitle className="text-2xl">{exam.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{exam.description}</p>
                <div className="space-y-2">
                  <h3 className="font-semibold">Subjects Covered:</h3>
                  <div className="flex flex-wrap gap-2">
                    {exam.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="px-3 py-1 rounded-full bg-primary/10 text-sm"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-4">
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/${exam.title.toLowerCase()}`)}
                  >
                    Start Preparing
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">Practice Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Take subject-wise and full-length mock tests</p>
              <Button variant="outline" className="w-full mt-4">
                View Tests
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">Study Material</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Access comprehensive notes and video lectures</p>
              <Button variant="outline" className="w-full mt-4">
                Browse Content
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Track your progress with detailed analytics</p>
              <Button variant="outline" className="w-full mt-4">
                View Stats
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;