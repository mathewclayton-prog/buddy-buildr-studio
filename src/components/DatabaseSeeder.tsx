import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Database, Users, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export const DatabaseSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingStep, setSeedingStep] = useState('');

  const seedDatabase = async () => {
    setIsSeeding(true);
    setSeedingStep('Generating fake users and conversations...');

    try {
      // Import and run the fake data generation
      const { generateFakeUsersAndChats } = await import('@/scripts/generateFakeData');
      await generateFakeUsersAndChats();
      
      setSeedingStep('Updating interaction counts...');
      
      // Import and run interaction count updates
      const { assignInteractionCounts, updateDailyInteractions } = await import('@/scripts/interactionCounts');
      await assignInteractionCounts();
      await updateDailyInteractions();
      
      setSeedingStep('Complete!');
      toast.success('Database seeded successfully! Catbots now have interaction data.');
      
      // Refresh page after a short delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error seeding database:', error);
      toast.error('Failed to seed database. Check console for details.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Setup
        </CardTitle>
        <CardDescription>
          Populate the database with sample data to see catbots in action
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Create 25 sample users
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Generate realistic conversations
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Update interaction counts
          </div>
        </div>
        
        <Button 
          onClick={seedDatabase} 
          disabled={isSeeding}
          className="w-full"
        >
          {isSeeding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {seedingStep}
            </>
          ) : (
            'Seed Database'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};