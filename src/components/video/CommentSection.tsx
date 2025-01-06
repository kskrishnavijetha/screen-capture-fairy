import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Smile, Heart, Laugh, Angry, MessageCircle } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface Comment {
  id: string;
  text: string;
  emoji?: string;
  timestamp: Date;
}

interface CommentSectionProps {
  videoId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ videoId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const emojis = [
    { icon: Smile, label: 'smile' },
    { icon: Heart, label: 'heart' },
    { icon: Laugh, label: 'laugh' },
    { icon: Angry, label: 'angry' },
  ];

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      emoji: selectedEmoji || undefined,
      timestamp: new Date(),
    };

    setComments([...comments, comment]);
    setNewComment('');
    setSelectedEmoji(null);

    toast({
      title: "Success",
      description: "Comment added successfully",
    });
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {emojis.map(({ icon: Icon, label }) => (
          <Button
            key={label}
            variant={selectedEmoji === label ? "default" : "outline"}
            size="icon"
            onClick={() => setSelectedEmoji(label)}
            className="w-10 h-10"
          >
            <Icon className="h-5 w-5" />
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1"
        />
        <Button onClick={handleAddComment} className="flex-shrink-0">
          <MessageCircle className="mr-2 h-4 w-4" />
          Comment
        </Button>
      </div>

      <div className="space-y-4 mt-6">
        {comments.map((comment) => (
          <Card key={comment.id} className="p-4">
            <div className="flex items-start gap-2">
              {comment.emoji && (
                <div className="flex-shrink-0">
                  {emojis.find(e => e.label === comment.emoji)?.icon && 
                    React.createElement(emojis.find(e => e.label === comment.emoji)!.icon, {
                      className: "h-5 w-5"
                    })}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {comment.timestamp.toLocaleString()}
                </p>
                <p className="mt-1">{comment.text}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};