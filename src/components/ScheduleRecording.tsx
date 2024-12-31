import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ScheduledRecording {
  date: Date;
  time: string;
  duration: string;
}

export const ScheduleRecording = () => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [duration, setDuration] = useState<string>();
  const [schedules, setSchedules] = useState<ScheduledRecording[]>([]);

  const handleSchedule = () => {
    if (!date || !time || !duration) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select date, time and duration for the recording."
      });
      return;
    }

    const newSchedule = {
      date,
      time,
      duration
    };

    setSchedules([...schedules, newSchedule]);
    
    // Schedule the recording using chrome.alarms API
    const scheduledTime = new Date(date);
    const [hours, minutes] = time.split(':');
    scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    chrome.alarms.create(`recording-${scheduledTime.getTime()}`, {
      when: scheduledTime.getTime()
    });

    toast({
      title: "Recording Scheduled",
      description: `Your recording has been scheduled for ${date.toLocaleDateString()} at ${time}`
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Clock className="mr-2 h-4 w-4" />
          Schedule Recording
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Recording</DialogTitle>
          <DialogDescription>
            Set up an automatic screen recording for a specific date and time.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Date</label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              disabled={(date) => date < new Date()}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Time</label>
            <Select onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, hour) => (
                  ['00', '30'].map(minute => (
                    <SelectItem 
                      key={`${hour}:${minute}`} 
                      value={`${hour.toString().padStart(2, '0')}:${minute}`}
                    >
                      {`${hour.toString().padStart(2, '0')}:${minute}`}
                    </SelectItem>
                  ))
                )).flat()}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Recording Duration</label>
            <Select onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSchedule} className="w-full">
            Schedule Recording
          </Button>

          {schedules.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Scheduled Recordings</h3>
              <div className="space-y-2">
                {schedules.map((schedule, index) => (
                  <div key={index} className="text-sm p-2 bg-secondary rounded-md">
                    {schedule.date.toLocaleDateString()} at {schedule.time} ({schedule.duration} minutes)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};