import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileActions } from '@/components/profile/ProfileActions';
import { RecordingsList } from '@/components/profile/RecordingsList';
import { Profile } from '@/types/profile';
import { Recording } from '@/types/recording';

const UserPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    loadRecordings();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
        return;
      }

      console.log('Current user:', user); // Debug log

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Profile data:', profileData, 'Error:', error); // Debug log

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        console.error('Error fetching profile:', error);
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: "Failed to load user profile"
        });
        return;
      }

      // If no profile exists, create one
      if (!profileData) {
        console.log('Creating new profile for user:', user.id); // Debug log
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || null,
              avatar_url: null
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }
        console.log('New profile created:', newProfile); // Debug log
        setProfile(newProfile);
      } else {
        console.log('Setting existing profile:', profileData); // Debug log
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      toast({
        variant: "destructive",
        title: "Error loading profile",
        description: "Failed to load user profile"
      });
    }
  };

  const loadRecordings = () => {
    try {
      const existingRecordings = localStorage.getItem('recordings');
      if (existingRecordings) {
        const parsedRecordings = JSON.parse(existingRecordings);
        const processedRecordings = parsedRecordings.map((recording: any) => ({
          ...recording,
          blob: new Blob([new Uint8Array(recording.blob)], { type: 'video/webm' }),
          timestamp: new Date(recording.timestamp)
        }));
        setRecordings(processedRecordings);
      }
    } catch (error) {
      console.error('Error loading recordings:', error);
      toast({
        variant: "destructive",
        title: "Error loading recordings",
        description: "Failed to load your recordings"
      });
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/signin');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message
      });
    }
  };

  const handlePreview = (recording: Recording) => {
    const url = URL.createObjectURL(recording.blob);
    window.open(url, '_blank');
  };

  const handleDownload = (recording: Recording) => {
    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your recording is being downloaded"
    });
  };

  return (
    <div className="min-h-screen p-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <Card className="max-w-3xl mx-auto">
        <CardHeader className="space-y-4">
          <CardTitle className="text-2xl">User Profile</CardTitle>
          {profile && (
            <ProfileHeader 
              profile={profile}
              uploading={uploading}
              onAvatarUpload={() => {}} // We'll implement this later
            />
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <ProfileActions 
            onNavigate={navigate}
            onSignOut={handleSignOut}
          />

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Previous Recordings</h3>
            <RecordingsList 
              recordings={recordings}
              onPreview={handlePreview}
              onDownload={handleDownload}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPage;