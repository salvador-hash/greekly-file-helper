import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, GraduationCap, Building, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { FRATERNITIES, INDUSTRIES } from '@/types';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    fraternity: '',
    gradYear: '',
    industry: '',
    major: '',
    varsitySport: '',
    clubs: '', // comma-separated
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Convert clubs comma-separated string to array (optional)
    const clubsArray = formData.clubs.trim() ? formData.clubs.split(',').map(s => s.trim()).filter(Boolean) : undefined;

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      university: formData.university,
      fraternity: formData.fraternity,
      gradYear: parseInt(formData.gradYear),
      industry: formData.industry,
      major: formData.major || undefined,
      varsitySport: formData.varsitySport || undefined,
      clubs: clubsArray,
    });
    
    if (result.success) {
      // Redirect to OTP verification
      toast({
        title: "Código enviado",
        description: "Te hemos enviado un código de verificación a tu email.",
      });
      navigate('/verify-otp', { state: { email: formData.email } });
    } else {
      toast({
        title: "Registration failed",
        description: result.error || "An account with this email already exists.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const isFormValid = 
    formData.name.length >= 2 &&
    formData.email.includes('@') &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword &&
    formData.university.length >= 2 &&
    formData.fraternity &&
    formData.gradYear;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent via-accent/90 to-primary relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-10" />
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-accent-foreground">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center"
          >
            <div className="w-24 h-24 rounded-2xl bg-accent-foreground/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
              <span className="text-6xl font-bold">Ω</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Join the Network</h2>
            <p className="text-xl text-accent-foreground/80 max-w-md">
              Connect with Greek life members across the country. Professional networking meets lifelong friendships.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-12 space-y-4"
          >
            {[
              'Find brothers & sisters nationwide',
              'Professional networking opportunities',
              'Private messaging & connections',
              'Chapter-specific communities',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-foreground/20 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <span className="text-accent-foreground/90">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-2xl">Ω</span>
            </div>
            <div>
              <h1 className="font-bold text-2xl text-foreground">GreekLink</h1>
              <p className="text-sm text-muted-foreground">Join the community</p>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Create your account</h2>
            <p className="text-muted-foreground text-sm">Fill in your details to join the Greek network.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="pl-10 h-11 bg-secondary/50 border-border/50"
                  />
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="pl-10 h-11 bg-secondary/50 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="pl-10 h-11 bg-secondary/50 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="pl-10 h-11 bg-secondary/50 border-border/50"
                  />
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="university" className="text-foreground font-medium">University</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="university"
                    placeholder="University of Texas"
                    value={formData.university}
                    onChange={(e) => handleChange('university', e.target.value)}
                    className="pl-10 h-11 bg-secondary/50 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-medium">Fraternity/Sorority</Label>
                <Select value={formData.fraternity} onValueChange={(v) => handleChange('fraternity', v)}>
                  <SelectTrigger className="h-11 bg-secondary/50 border-border/50">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 bg-card">
                    {FRATERNITIES.map((org) => (
                      <SelectItem key={org} value={org}>{org}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-medium">Graduation Year</Label>
                <Select value={formData.gradYear} onValueChange={(v) => handleChange('gradYear', v)}>
                  <SelectTrigger className="h-11 bg-secondary/50 border-border/50">
                    <SelectValue placeholder="Year..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 bg-card">
                    {years.map((year) => (
                      <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label className="text-foreground font-medium">Industry</Label>
                <Select value={formData.industry} onValueChange={(v) => handleChange('industry', v)}>
                  <SelectTrigger className="h-11 bg-secondary/50 border-border/50">
                    <SelectValue placeholder="Select your industry..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 bg-card">
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label className="text-foreground font-medium">Major</Label>
                <Input value={formData.major} onChange={(e) => handleChange('major', e.target.value)} className="h-11 bg-secondary/50" />
              </div>

              <div className="col-span-2 space-y-2">
                <Label className="text-foreground font-medium">Varsity Sport (optional)</Label>
                <Input value={formData.varsitySport} onChange={(e) => handleChange('varsitySport', e.target.value)} className="h-11 bg-secondary/50" />
              </div>

              <div className="col-span-2 space-y-2">
                <Label className="text-foreground font-medium">Clubs (comma-separated)</Label>
                <Input value={formData.clubs} onChange={(e) => handleChange('clubs', e.target.value)} placeholder="e.g. Debate Club, Chess Club" className="h-11 bg-secondary/50" />
              </div>

            </div>

            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-muted-foreground text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
