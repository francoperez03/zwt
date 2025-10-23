import { useState, useEffect, useMemo } from 'react';
import axios, { AxiosError } from 'axios';
import { useIdentity } from '../hooks/useIdentity';
import { setupSemaphoreInterceptor } from '../apiClient';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { RequestResponseViewer } from './RequestResponseViewer';
import { StepIndicator } from './StepIndicator';
import { Loader2, Lock, ShieldCheck, Info, Users } from 'lucide-react';

function ProtectedView() {
  const { identity } = useIdentity();
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [proofGenerationRequest, setProofGenerationRequest] = useState<any>(null);
  const [proofGenerationResponse, setProofGenerationResponse] = useState<any>(null);
  const [protectedRequest, setProtectedRequest] = useState<any>(null);
  const [protectedResponse, setProtectedResponse] = useState<any>(null);

  useEffect(() => {
    // Fetch group members on mount
    setCurrentStep(1);
    axios.get('http://localhost:3000/auth/group-members')
      .then(res => {
        setGroupMembers(res.data.members);
        setCurrentStep(2);
        
        // Store this request/response for display
        setProofGenerationRequest({
          method: 'GET',
          url: 'http://localhost:3000/auth/group-members',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        setProofGenerationResponse({
          status: res.status,
          statusText: res.statusText,
          data: res.data
        });
      })
      .catch(err => {
        console.error('Failed to fetch group members:', err);
        setError('Error al obtener miembros del grupo');
      });
  }, []);

  const api = useMemo(() => {
    if (identity && groupMembers.length > 0) {
      return setupSemaphoreInterceptor({
        identity,
        groupMembers
      });
    }
    return null;
  }, [identity, groupMembers]);

  const fetchProtectedData = async () => {
    if (!api) {
      setError('Cliente API no está listo. Necesitas una identidad y miembros del grupo.');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);
    setProtectedRequest(null);
    setProtectedResponse(null);
    setCurrentStep(3);

    try {
      // The interceptor will automatically add the proof
      const response = await api.get('/protected/view');
      
      // Extract the proof from headers (the interceptor added it)
      const proofHeader = response.config.headers['X-ZWT-TOKEN'];
      let proofData = null;
      
      if (typeof proofHeader === 'string') {
        try {
          proofData = JSON.parse(proofHeader);
        } catch {
          proofData = proofHeader;
        }
      }

      setProtectedRequest({
        method: 'GET',
        url: 'http://localhost:3000/protected/view',
        headers: {
          'Content-Type': 'application/json',
          'X-ZWT-TOKEN': proofData ? {
            proof: '{ ... estructura compleja de prueba ZK ... }',
            nullifierHash: proofData.nullifierHash || 'hash del nullifier',
            externalNullifier: proofData.externalNullifier || 'external nullifier',
            signal: proofData.signal || 'signal'
          } : 'Prueba ZK generada automáticamente'
        }
      });

      setProtectedResponse({
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      setData(response.data);
      setCurrentStep(4);
    } catch (err: any) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError((axiosError.response?.data as any)?.message || 'Error al obtener datos protegidos');
      
      if (axiosError.response) {
        setProtectedResponse({
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
          data: axiosError.response.data
        });
      }
      
      console.error(err);
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: '1', title: 'Identidad', description: 'Tu identidad ZK' },
    { id: '2', title: 'Grupo', description: 'Obtener miembros' },
    { id: '3', title: 'Prueba', description: 'Generar ZK proof' },
    { id: '4', title: 'Acceso', description: 'Recurso protegido' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Acceso a Recurso Protegido</CardTitle>
              <CardDescription className="text-base mt-1">
                Paso 2: Genera una prueba zero-knowledge para acceder sin revelar tu identidad
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Box */}
          <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="text-foreground">
                <strong>¿Cómo funciona?</strong>
              </p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-1 ml-2">
                <li>Obtenemos la lista de miembros del grupo (commitments públicos)</li>
                <li>Generamos una prueba ZK que demuestra que perteneces al grupo</li>
                <li>El servidor verifica la prueba SIN saber quién eres específicamente</li>
                <li>Si la prueba es válida, obtienes acceso al recurso protegido</li>
              </ol>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="py-4">
            <StepIndicator steps={steps} currentStep={currentStep} />
          </div>

          {/* Group Members Info */}
          {groupMembers.length > 0 && (
            <div className="p-4 bg-secondary/50 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Miembros del Grupo</span>
                <Badge variant="secondary">{groupMembers.length}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                El grupo contiene {groupMembers.length} identidad(es) registrada(s). 
                Tu identidad es una de ellas, pero nadie sabrá cuál específicamente cuando generes la prueba.
              </p>
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={fetchProtectedData} 
            disabled={loading || !api}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando Prueba y Accediendo...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Acceder a Recurso Protegido
              </>
            )}
          </Button>

          {!api && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400">
                ⚠️ Necesitas crear una identidad primero y esperar a que se carguen los miembros del grupo.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {data && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-600">
                  ✓ Acceso Concedido
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Has accedido exitosamente sin revelar tu identidad
                </span>
              </div>
              <div className="mt-3 p-3 bg-background/50 rounded border border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  DATOS PROTEGIDOS:
                </p>
                <pre className="text-xs font-mono text-green-400">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* HTTP Calls Viewers */}
      {proofGenerationRequest && proofGenerationResponse && (
        <RequestResponseViewer
          title="📡 Llamada HTTP 1: GET /auth/group-members"
          description="Obtenemos la lista de commitments del grupo para construir el Merkle tree necesario para la prueba"
          request={proofGenerationRequest}
          response={proofGenerationResponse}
        />
      )}

      {protectedRequest && (
        <RequestResponseViewer
          title="📡 Llamada HTTP 2: GET /protected/view"
          description="Accedemos al recurso protegido enviando la prueba ZK en el header X-ZWT-TOKEN. El servidor verifica la prueba sin saber tu identidad."
          request={protectedRequest}
          response={protectedResponse}
          loading={loading}
        />
      )}
    </div>
  );
}

export default ProtectedView;
