import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Presentation, FileText } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

type ExportFormat = 'pptx' | 'slides' | 'pdf';

interface ExportControlsProps {
  recordedBlob: Blob;
}

export const ExportControls = ({ recordedBlob }: ExportControlsProps) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // In a real implementation, this would connect to a backend service
      // that would handle the conversion and return the exported file
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated processing time
      
      toast({
        title: "Export Feature",
        description: `This is a placeholder for ${selectedFormat.toUpperCase()} export functionality. Integration with ${selectedFormat === 'pptx' ? 'PowerPoint' : selectedFormat === 'slides' ? 'Google Slides' : 'PDF'} API is required.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting your recording.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Export Format</label>
        <Select
          value={selectedFormat}
          onValueChange={(value: ExportFormat) => setSelectedFormat(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select export format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pptx">
              <div className="flex items-center">
                <Presentation className="w-4 h-4 mr-2" />
                PowerPoint
              </div>
            </SelectItem>
            <SelectItem value="slides">
              <div className="flex items-center">
                <Presentation className="w-4 h-4 mr-2" />
                Google Slides
              </div>
            </SelectItem>
            <SelectItem value="pdf">
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full"
        variant="outline"
      >
        <FileDown className="w-4 h-4 mr-2" />
        {isExporting ? "Exporting..." : "Export Recording"}
      </Button>
    </div>
  );
};