import React, { useState, KeyboardEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Smile, Heart, Laugh, Angry, MessageCircle } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface Comment {
  id: string;
  text: string;
  emoji?: string;
  timestamp: Date;
  username: string;
}

interface CommentSectionProps {
  videoId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ videoId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [username, setUsername] = useState('User'); // In a real app, this would come from authentication

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
      username: username,
    };

    setComments([...comments, comment]);
    setNewComment('');
    setSelectedEmoji(null);

    toast({
      title: "Success",
      description: "Comment added successfully",
    });
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
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
          onKeyPress={handleKeyPress}
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
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{comment.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.username}</span>
                  <span className="text-sm text-muted-foreground">
                    {comment.timestamp.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {comment.emoji && (
                    <div className="flex-shrink-0">
                      {emojis.find(e => e.label === comment.emoji)?.icon && 
                        React.createElement(emojis.find(e => e.label === comment.emoji)!.icon, {
                          className: "h-4 w-4"
                        })}
                    </div>
                  )}
                  <p className="text-sm">{comment.text}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};