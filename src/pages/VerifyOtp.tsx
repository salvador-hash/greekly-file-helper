import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();
  
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleVerify = async () => {
    if (otp.length !== 8) return;
    
    setIsLoading(true);
    const result = await verifyOtp(email, otp);
    
    if (result.success) {
      toast({
        title: "¡Bienvenido a GreekLink!",
        description: "Tu cuenta ha sido verificada exitosamente.",
      });
      navigate('/home');
    } else {
      toast({
        title: "Código inválido",
        description: result.error || "El código ingresado no es correcto. Intenta de nuevo.",
        variant: "destructive",
      });
      setOtp('');
    }
    
    setIsLoading(false);
  };

  const handleResend = async () => {
    setIsResending(true);
    const result = await resendOtp(email);
    
    if (result.success) {
      toast({
        title: "Código reenviado",
        description: "Te hemos enviado un nuevo código de verificación.",
      });
      setCountdown(60);
      setCanResend(false);
    } else {
      toast({
        title: "Error al reenviar",
        description: result.error || "No pudimos reenviar el código. Intenta más tarde.",
        variant: "destructive",
      });
    }
    
    setIsResending(false);
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back Link */}
        <Link 
          to="/register" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al registro
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-bold text-2xl">Ω</span>
          </div>
          <div>
            <h1 className="font-bold text-2xl text-foreground">GreekLink</h1>
            <p className="text-sm text-muted-foreground">Verificación de cuenta</p>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Ingresa el código</h2>
          <p className="text-muted-foreground">
            Enviamos un código de 8 dígitos a{' '}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center mb-8">
          <InputOTP
            maxLength={8}
            value={otp}
            onChange={setOtp}
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={0} className="w-10 h-12 text-lg border-border bg-secondary/50" />
              <InputOTPSlot index={1} className="w-10 h-12 text-lg border-border bg-secondary/50" />
              <InputOTPSlot index={2} className="w-10 h-12 text-lg border-border bg-secondary/50" />
              <InputOTPSlot index={3} className="w-10 h-12 text-lg border-border bg-secondary/50" />
              <InputOTPSlot index={4} className="w-10 h-12 text-lg border-border bg-secondary/50" />
              <InputOTPSlot index={5} className="w-10 h-12 text-lg border-border bg-secondary/50" />
              <InputOTPSlot index={6} className="w-10 h-12 text-lg border-border bg-secondary/50" />
              <InputOTPSlot index={7} className="w-10 h-12 text-lg border-border bg-secondary/50" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          disabled={otp.length !== 8 || isLoading}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            'Verificar código'
          )}
        </Button>

        {/* Resend */}
        <div className="mt-6 text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
              Reenviar código
            </button>
          ) : (
            <p className="text-muted-foreground text-sm">
              Reenviar código en <span className="font-medium text-foreground">{countdown}s</span>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
