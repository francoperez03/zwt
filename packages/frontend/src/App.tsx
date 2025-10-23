import Signup from './components/Signup';
import ProtectedView from './components/ProtectedView';
import { useIdentity } from './hooks/useIdentity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Shield, KeyRound, Github, Book } from 'lucide-react';

function App() {
  const { identity } = useIdentity();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  ZWT - Zero-Knowledge Token
                </h1>
                <p className="text-sm text-muted-foreground">
                  Autenticación anónima con Semaphore Protocol
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {identity && (
                <Badge variant="default" className="gap-1.5">
                  <KeyRound className="w-3 h-3" />
                  Identidad Activa
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="signup" className="gap-2">
              <KeyRound className="w-4 h-4" />
              1. Crear Identidad
            </TabsTrigger>
            <TabsTrigger value="protected" disabled={!identity} className="gap-2">
              <Shield className="w-4 h-4" />
              2. Acceso Protegido
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signup" className="mt-0">
            <Signup />
          </TabsContent>

          <TabsContent value="protected" className="mt-0">
            {identity ? (
              <ProtectedView />
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                  <Shield className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Identidad Requerida
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Necesitas crear una identidad primero para acceder a los recursos protegidos.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <p>Zero-Knowledge Token Demo - Powered by Semaphore Protocol</p>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/semaphore-protocol/semaphore" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="w-4 h-4" />
                Semaphore GitHub
              </a>
              <a 
                href="https://docs.semaphore.pse.dev/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Book className="w-4 h-4" />
                Documentación
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
