import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useIdentity } from '../hooks/useIdentity';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { RequestResponseViewer } from './RequestResponseViewer';
import { IdentityCard } from './IdentityCard';
import { Loader2, UserPlus, Info } from 'lucide-react';

function Signup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<any>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const { identity, saveIdentity, clearIdentity } = useIdentity();

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    setRequestData(null);
    setResponseData(null);

    const req = {
      method: 'POST',
      url: 'http://localhost:3000/auth/signup',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    setRequestData(req);

    try {
      const response = await axios.post('http://localhost:3000/auth/signup');

      const res = {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      };

      setResponseData(res);

      if (response.data.success) {
        saveIdentity(response.data.identity);
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      setError('Error al crear identidad. Verifica que el servidor esté ejecutándose.');
      
      if (axiosError.response) {
        setResponseData({
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
          data: axiosError.response.data
        });
      }
      
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Crear Identidad Anónima</CardTitle>
              <CardDescription className="text-base mt-1">
                Paso 1: Genera tu identidad basada en Semaphore Protocol
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="text-foreground">
                <strong>¿Qué es esto?</strong>
              </p>
              <p className="text-muted-foreground">
                El servidor generará una identidad Semaphore que incluye:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-0.5 ml-2">
                <li><strong className="text-foreground">Private Key:</strong> Tu clave secreta (guárdala bien)</li>
                <li><strong className="text-foreground">Public Key:</strong> Tu clave pública</li>
                <li><strong className="text-foreground">Commitment:</strong> Tu ID público registrado en el grupo</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Con esta identidad podrás generar pruebas zero-knowledge para acceder a recursos protegidos sin revelar quién eres.
              </p>
            </div>
          </div>

          {!identity ? (
            <>
              <Button 
                onClick={handleSignup} 
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando Identidad...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Mi Identidad
                  </>
                )}
              </Button>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <Badge variant="default" className="bg-green-600">
                  ✓ Identidad Creada
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Tu identidad ha sido generada y guardada localmente
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Identity Display */}
      {identity && (
        <IdentityCard identity={identity} onClear={clearIdentity} />
      )}

      {/* HTTP Call Viewer */}
      {(requestData || responseData) && (
        <RequestResponseViewer
          title="📡 Llamada HTTP: POST /auth/signup"
          description="Este endpoint genera una nueva identidad Semaphore y la registra en el grupo del servidor"
          request={requestData}
          response={responseData}
          loading={loading}
        />
      )}
    </div>
  );
}

export default Signup;
