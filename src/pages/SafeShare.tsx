import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Share2, Clock, Shield } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { generateEncryptionKey, encryptBlob } from '@/utils/encryption';

const SafeShare = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    checkAuth();
    loadFiles();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/signin');
    }
  };

  const loadFiles = async () => {
    const { data, error } = await supabase
      .from('shared_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading files",
        description: error.message
      });
    } else {
      setFiles(data || []);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate encryption key
      const password = crypto.randomUUID();
      const key = await generateEncryptionKey(password);
      
      // Encrypt file
      const { encryptedData, iv } = await encryptBlob(file, key);
      
      // Upload to Supabase Storage
      const filePath = `${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('secure_files')
        .upload(filePath, new Blob([encryptedData]), {
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Save file metadata
      const { error: dbError } = await supabase
        .from('shared_files')
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          encryption_key: password,
          is_encrypted: true,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "File uploaded successfully"
      });

      loadFiles();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const generateShareLink = async (fileId: string) => {
    try {
      const shareToken = crypto.randomUUID();
      const { error } = await supabase
        .from('file_shares')
        .insert({
          file_id: fileId,
          access_type: 'view',
          share_token: shareToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

      if (error) throw error;

      const shareLink = `${window.location.origin}/share/${shareToken}`;
      await navigator.clipboard.writeText(shareLink);
      
      toast({
        title: "Share link created",
        description: "Link copied to clipboard"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating share link",
        description: error.message
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            SafeShare
          </CardTitle>
          <CardDescription>
            Secure file sharing made simple
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="files">My Files</TabsTrigger>
              <TabsTrigger value="shared">Shared with Me</TabsTrigger>
            </TabsList>
            
            <TabsContent value="files">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label
                    htmlFor="file-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90"
                  >
                    <Upload className="h-4 w-4" />
                    Upload File
                  </Label>
                  {isUploading && (
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid gap-4">
                  {files.map((file) => (
                    <Card key={file.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{file.file_name}</CardTitle>
                        <CardDescription>
                          {new Date(file.created_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => generateShareLink(file.id)}
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="shared">
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4" />
                <p>Shared files will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SafeShare;