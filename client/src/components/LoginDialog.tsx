import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus, Sparkles } from 'lucide-react';
import { getRandomUserColor } from '@/lib/colors';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [loginUsername, setLoginUsername] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerName, setRegisterName] = useState('');
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (username: string) => {
      // In a real app, this would validate credentials
      const users = await fetch('/api/leaderboard').then(r => r.json());
      const user = users.find((u: any) => u.username === username);
      if (!user) throw new Error('Usuario no encontrado');
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/current-user'] });
      toast({
        title: '✅ Sesión iniciada',
        description: '¡Bienvenido de nuevo!',
        className: 'animate-bounce-in',
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo iniciar sesión',
        variant: 'destructive',
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; name: string }) => {
      const response = await apiRequest('POST', '/api/users', {
        username: data.username,
        name: data.name,
        color: getRandomUserColor(),
        avatar: '',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/current-user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      toast({
        title: '🎉 Cuenta creada',
        description: '¡Bienvenido a Runna.io!',
        className: 'animate-bounce-in',
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la cuenta',
        variant: 'destructive',
      });
    },
  });

  const handleLogin = () => {
    if (!loginUsername.trim()) {
      toast({
        title: 'Error',
        description: 'Ingresa tu nombre de usuario',
        variant: 'destructive',
      });
      return;
    }
    loginMutation.mutate(loginUsername);
  };

  const handleRegister = () => {
    if (!registerUsername.trim() || !registerName.trim()) {
      toast({
        title: 'Error',
        description: 'Completa todos los campos',
        variant: 'destructive',
      });
      return;
    }
    registerMutation.mutate({ username: registerUsername, name: registerName });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-primary" />
              <div className="absolute inset-0 bg-primary/20 blur-md animate-pulse" />
            </div>
            Runna.io
          </DialogTitle>
          <DialogDescription>
            Inicia sesión o crea una cuenta para empezar a conquistar
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="login-username">Nombre de usuario</Label>
              <Input
                id="login-username"
                placeholder="@tunombre"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="transition-all duration-300 focus:scale-[1.02]"
                data-testid="input-login-username"
              />
            </div>

            <Button
              onClick={handleLogin}
              disabled={loginMutation.isPending}
              className="w-full gradient-primary border-0 hover:scale-105 active:scale-95 transition-all duration-300"
              data-testid="button-login"
            >
              <LogIn className="h-5 w-5 mr-2" />
              {loginMutation.isPending ? 'Iniciando...' : 'Iniciar sesión'}
            </Button>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="register-name">Nombre completo</Label>
              <Input
                id="register-name"
                placeholder="Juan Pérez"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                className="transition-all duration-300 focus:scale-[1.02]"
                data-testid="input-register-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-username">Nombre de usuario</Label>
              <Input
                id="register-username"
                placeholder="@tunombre"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                className="transition-all duration-300 focus:scale-[1.02]"
                data-testid="input-register-username"
              />
            </div>

            <Button
              onClick={handleRegister}
              disabled={registerMutation.isPending}
              className="w-full gradient-primary border-0 hover:scale-105 active:scale-95 transition-all duration-300"
              data-testid="button-register"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              {registerMutation.isPending ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
