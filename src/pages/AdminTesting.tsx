import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { Play, Loader2, Download, ChevronLeft } from "lucide-react";

interface Catbot {
  id: string;
  name: string;
  avatar_url: string;
}

interface TestResult {
  catbotId: string;
  catbotName: string;
  variantName: string;
  questionIndex: number;
  question: string;
  response: string;
  responseTime: number;
  tokensUsed: number;
  promptTokens?: number;
  completionTokens?: number;
  status: 'pending' | 'success' | 'error';
  error?: string;
  openaiParams?: {
    model: string;
    temperature: number;
    max_tokens: number;
    presence_penalty: number;
    frequency_penalty: number;
  };
}

interface ConfigVariant {
  variantName: string;
  name?: string;
  public_profile?: string;
  training_description?: string;
  greeting?: string;
  advanced_definition?: string;
  suggested_starters?: string[];
  tags?: string[];
}

export default function AdminTesting() {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [testType, setTestType] = useState<'multi-catbot' | 'config-variation'>('multi-catbot');
  
  // Multi-catbot test state
  const [availableCatbots, setAvailableCatbots] = useState<Catbot[]>([]);
  const [selectedCatbots, setSelectedCatbots] = useState<string[]>([]);
  const [catbotSearchQuery, setCatbotSearchQuery] = useState<string>('');
  
  // Config variation test state
  const [selectedCatbot, setSelectedCatbot] = useState<string>('');
  const [baseCatbot, setBaseCatbot] = useState<any>(null);
  const [variants, setVariants] = useState<ConfigVariant[]>([
    { variantName: 'Baseline (Original)' }
  ]);
  
  // Common test state
  const [testQuestions, setTestQuestions] = useState<string>('');
  const [promptVersion, setPromptVersion] = useState<'enhanced' | 'legacy'>('enhanced');
  const [testName, setTestName] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testHistory, setTestHistory] = useState<any[]>([]);
  
  // OpenAI parameters
  const [testOpenAIParams, setTestOpenAIParams] = useState({
    model: 'gpt-4o-mini',
    temperature: 0.8,
    max_tokens: 300,
    presence_penalty: 0.1,
    frequency_penalty: 0.1
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    loadCatbots();
    loadTestHistory();
  }, []);

  const loadCatbots = async () => {
    const { data, error } = await supabase
      .from('catbots')
      .select('id, name, avatar_url')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAvailableCatbots(data);
    }
  };

  const loadTestHistory = async () => {
    const { data, error } = await supabase
      .from('test_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setTestHistory(data);
    }
  };

  const loadCatbotDetails = async (catbotId: string) => {
    const { data: catbot } = await supabase
      .from('catbots')
      .select('*')
      .eq('id', catbotId)
      .single();

    const { data: training } = await supabase
      .from('catbot_training_data')
      .select('training_description')
      .eq('catbot_id', catbotId)
      .single();

    if (catbot) {
      setBaseCatbot({
        ...catbot,
        training_description: training?.training_description
      });
      
      // Reset variants to baseline
      setVariants([
        { 
          variantName: 'Baseline (Original)',
          name: catbot.name,
          public_profile: catbot.public_profile,
          training_description: training?.training_description,
          greeting: catbot.greeting,
          advanced_definition: catbot.advanced_definition,
          suggested_starters: catbot.suggested_starters,
          tags: catbot.tags
        }
      ]);
    }
  };

  const addVariant = () => {
    if (variants.length >= 5) {
      toast({
        title: "Maximum variants reached",
        description: "You can test up to 5 configuration variants.",
        variant: "destructive"
      });
      return;
    }

    setVariants([
      ...variants,
      {
        variantName: `Variant ${variants.length}`,
        ...baseCatbot
      }
    ]);
  };

  const updateVariant = (index: number, field: keyof ConfigVariant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const runTests = async () => {
    const questions = testQuestions.split('\n').filter(q => q.trim()).slice(0, 10);
    
    if (questions.length === 0) {
      toast({
        title: "No questions provided",
        description: "Please enter at least one test question.",
        variant: "destructive"
      });
      return;
    }

    if (testType === 'multi-catbot' && selectedCatbots.length === 0) {
      toast({
        title: "No catbots selected",
        description: "Please select at least one catbot to test.",
        variant: "destructive"
      });
      return;
    }

    if (testType === 'config-variation' && !selectedCatbot) {
      toast({
        title: "No catbot selected",
        description: "Please select a catbot to test.",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setResults([]);

    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Create test run
      const { data: testRun, error: testRunError } = await supabase
        .from('test_runs')
        .insert([{
          created_by: user.user.id,
          test_name: testName || `Test ${new Date().toLocaleString()}`,
          test_type: testType,
          catbot_ids: testType === 'multi-catbot' ? selectedCatbots : [selectedCatbot],
          test_questions: questions as any,
          prompt_version: promptVersion,
          configuration_snapshots: testType === 'config-variation' ? { variants } as any : {} as any,
          status: 'running'
        }])
        .select()
        .single();

      if (testRunError) throw testRunError;

      // Run tests
      const testCombinations = testType === 'multi-catbot'
        ? selectedCatbots.flatMap(catbotId => 
            questions.map((question, questionIndex) => ({
              catbotId,
              catbotName: availableCatbots.find(c => c.id === catbotId)?.name || '',
              variantName: 'Standard',
              questionIndex,
              question,
              configOverride: undefined
            }))
          )
        : variants.flatMap(variant =>
            questions.map((question, questionIndex) => ({
              catbotId: selectedCatbot,
              catbotName: baseCatbot?.name || '',
              variantName: variant.variantName,
              questionIndex,
              question,
              configOverride: variant.variantName === 'Baseline (Original)' ? undefined : {
                name: variant.name,
                public_profile: variant.public_profile,
                training_description: variant.training_description,
                greeting: variant.greeting,
                advanced_definition: variant.advanced_definition,
                suggested_starters: variant.suggested_starters,
                tags: variant.tags
              }
            }))
          );

      const testResults: TestResult[] = [];

      for (const combo of testCombinations) {
        const result: TestResult = {
          ...combo,
          response: '',
          responseTime: 0,
          tokensUsed: 0,
          status: 'pending'
        };
        
        setResults(prev => [...prev, result]);

        try {
          const { data, error } = await supabase.functions.invoke('test-chat', {
            body: {
              catbotId: combo.catbotId,
              question: combo.question,
              promptVersion: promptVersion,
              configOverride: combo.configOverride,
              openaiParams: testOpenAIParams
            }
          });

          if (error) throw error;

          result.response = data.response;
          result.responseTime = data.responseTimeMs;
          result.tokensUsed = data.tokensUsed;
          result.promptTokens = data.promptTokens;
          result.completionTokens = data.completionTokens;
          result.openaiParams = data.openaiParams;
          result.status = 'success';

          // Save to database
          await supabase.from('test_responses').insert({
            test_run_id: testRun.id,
            catbot_id: combo.catbotId,
            variant_name: combo.variantName,
            question_index: combo.questionIndex,
            question_text: combo.question,
            response_text: data.response,
            response_time_ms: data.responseTimeMs,
            tokens_used: data.tokensUsed,
            prompt_tokens: data.promptTokens,
            completion_tokens: data.completionTokens,
            openai_params: data.openaiParams
          });

        } catch (error: any) {
          result.status = 'error';
          result.error = error.message;
        }

        testResults.push(result);
        setResults(prev => prev.map(r => 
          r.catbotId === combo.catbotId && 
          r.questionIndex === combo.questionIndex && 
          r.variantName === combo.variantName ? result : r
        ));
      }

      // Mark test run as completed
      await supabase
        .from('test_runs')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', testRun.id);

      toast({
        title: "Tests completed",
        description: `Successfully ran ${testCombinations.length} test combinations.`
      });

      loadTestHistory();

    } catch (error: any) {
      console.error('Test error:', error);
      toast({
        title: "Test failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const exportResults = () => {
    const csv = [
      ['Catbot', 'Variant', 'Question Index', 'Question', 'Response', 'Response Time (ms)', 'Input Tokens', 'Output Tokens', 'Total Tokens', 'Status'].join(','),
      ...results.map(r => [
        r.catbotName,
        r.variantName,
        r.questionIndex,
        `"${r.question.replace(/"/g, '""')}"`,
        `"${r.response.replace(/"/g, '""')}"`,
        r.responseTime,
        r.promptTokens || '',
        r.completionTokens || '',
        r.tokensUsed,
        r.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${Date.now()}.csv`;
    a.click();
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Chatbot Testing Dashboard</h1>
          <p className="text-muted-foreground">Test and compare chatbot responses and configurations</p>
        </div>
      </div>

      <Tabs value={testType} onValueChange={(v) => setTestType(v as any)}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="multi-catbot">Compare Catbots</TabsTrigger>
          <TabsTrigger value="config-variation">Test Configurations</TabsTrigger>
        </TabsList>

        <TabsContent value="multi-catbot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Catbot Comparison</CardTitle>
              <CardDescription>Test the same questions across different catbots</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Catbots (up to 5)</Label>
                <Input
                  type="text"
                  placeholder="Search catbots by name..."
                  value={catbotSearchQuery}
                  onChange={(e) => setCatbotSearchQuery(e.target.value)}
                  className="mb-3"
                />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableCatbots
                    .filter(catbot => 
                      catbot.name.toLowerCase().includes(catbotSearchQuery.toLowerCase())
                    )
                    .map(catbot => (
                    <div
                      key={catbot.id}
                      className={`p-3 border rounded-lg cursor-pointer transition ${
                        selectedCatbots.includes(catbot.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        if (selectedCatbots.includes(catbot.id)) {
                          setSelectedCatbots(selectedCatbots.filter(id => id !== catbot.id));
                        } else if (selectedCatbots.length < 5) {
                          setSelectedCatbots([...selectedCatbots, catbot.id]);
                        }
                      }}
                    >
                      <div className="font-medium text-sm">{catbot.name}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Showing {availableCatbots.filter(catbot => 
                      catbot.name.toLowerCase().includes(catbotSearchQuery.toLowerCase())
                    ).length} of {availableCatbots.length} catbots
                  </span>
                  <span>Selected: {selectedCatbots.length}/5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config-variation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Variation Testing</CardTitle>
              <CardDescription>Test different configurations of the same catbot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Catbot</Label>
                <Select value={selectedCatbot} onValueChange={(val) => {
                  setSelectedCatbot(val);
                  loadCatbotDetails(val);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a catbot..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCatbots.map(catbot => (
                      <SelectItem key={catbot.id} value={catbot.id}>
                        {catbot.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {baseCatbot && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Configuration Variants ({variants.length}/5)</Label>
                    <Button
                      size="sm"
                      onClick={addVariant}
                      disabled={variants.length >= 5}
                    >
                      Add Variant
                    </Button>
                  </div>

                  {variants.map((variant, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <Input
                          value={variant.variantName}
                          onChange={(e) => updateVariant(index, 'variantName', e.target.value)}
                          placeholder="Variant name"
                        />
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-xs">Name</Label>
                          <Input
                            value={variant.name || ''}
                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                            placeholder="Character name"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Public Profile</Label>
                          <Textarea
                            value={variant.public_profile || ''}
                            onChange={(e) => updateVariant(index, 'public_profile', e.target.value)}
                            placeholder="Short description"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Training Description</Label>
                          <Textarea
                            value={variant.training_description || ''}
                            onChange={(e) => updateVariant(index, 'training_description', e.target.value)}
                            placeholder="Personality & history"
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Test Name (optional)</Label>
            <Input
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g., Tone variation test"
            />
          </div>

          <div className="space-y-2">
            <Label>Test Questions (one per line, max 10)</Label>
            <Textarea
              value={testQuestions}
              onChange={(e) => setTestQuestions(e.target.value)}
              placeholder="What's your favorite hobby?&#10;Tell me about yourself&#10;How are you feeling today?"
              rows={6}
            />
            <p className="text-sm text-muted-foreground">
              {testQuestions.split('\n').filter(q => q.trim()).length} questions
            </p>
          </div>

          <div className="space-y-2">
            <Label>Prompt Version</Label>
            <Select value={promptVersion} onValueChange={(v: any) => setPromptVersion(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enhanced">Enhanced Prompt</SelectItem>
                <SelectItem value="legacy">Legacy Prompt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={runTests}
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Tests
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>OpenAI Parameters</CardTitle>
          <CardDescription>
            Test different OpenAI API parameters to optimize response quality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Model</Label>
              <Select
                value={testOpenAIParams.model}
                onValueChange={(value) => setTestOpenAIParams(prev => ({...prev, model: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini (Production Default)</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Max Tokens: {testOpenAIParams.max_tokens}</Label>
              <Slider
                value={[testOpenAIParams.max_tokens]}
                onValueChange={([value]) => setTestOpenAIParams(prev => ({...prev, max_tokens: value}))}
                min={50}
                max={1000}
                step={50}
              />
              <p className="text-xs text-muted-foreground">Controls response length</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Temperature: {testOpenAIParams.temperature.toFixed(1)}</Label>
              <Slider
                value={[testOpenAIParams.temperature]}
                onValueChange={([value]) => setTestOpenAIParams(prev => ({...prev, temperature: value}))}
                min={0}
                max={2}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">
                Lower = focused, Higher = creative
              </p>
            </div>

            <div className="space-y-2">
              <Label>Presence Penalty: {testOpenAIParams.presence_penalty.toFixed(1)}</Label>
              <Slider
                value={[testOpenAIParams.presence_penalty]}
                onValueChange={([value]) => setTestOpenAIParams(prev => ({...prev, presence_penalty: value}))}
                min={-2}
                max={2}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">
                Encourages new topics
              </p>
            </div>

            <div className="space-y-2">
              <Label>Frequency Penalty: {testOpenAIParams.frequency_penalty.toFixed(1)}</Label>
              <Slider
                value={[testOpenAIParams.frequency_penalty]}
                onValueChange={([value]) => setTestOpenAIParams(prev => ({...prev, frequency_penalty: value}))}
                min={-2}
                max={2}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">
                Reduces repetition
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setTestOpenAIParams({
              model: 'gpt-4o-mini',
              temperature: 0.8,
              max_tokens: 300,
              presence_penalty: 0.1,
              frequency_penalty: 0.1
            })}
          >
            Reset to Production Defaults
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  {results.filter(r => r.status === 'success').length}/{results.length} completed
                </CardDescription>
              </div>
              <Button onClick={exportResults} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Catbot</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Time (ms)</TableHead>
                  <TableHead>Input</TableHead>
                  <TableHead>Output</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{result.catbotName}</TableCell>
                    <TableCell>{result.variantName}</TableCell>
                    <TableCell className="max-w-xs truncate">{result.question}</TableCell>
                    <TableCell className="max-w-md">
                      <div className="text-sm whitespace-pre-wrap">{result.response || '...'}</div>
                    </TableCell>
                    <TableCell>{result.responseTime || '-'}</TableCell>
                    <TableCell>{result.promptTokens || '-'}</TableCell>
                    <TableCell>{result.completionTokens || '-'}</TableCell>
                    <TableCell>{result.tokensUsed || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={
                        result.status === 'success' ? 'default' :
                        result.status === 'error' ? 'destructive' : 
                        'secondary'
                      }>
                        {result.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {testHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test History</CardTitle>
            <CardDescription>Recent test runs</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testHistory.map(test => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.test_name}</TableCell>
                    <TableCell>{test.test_type}</TableCell>
                    <TableCell>{new Date(test.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={test.status === 'completed' ? 'default' : 'secondary'}>
                        {test.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
