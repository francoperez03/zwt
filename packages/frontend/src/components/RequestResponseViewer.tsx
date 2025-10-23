import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowRight, Server, User } from 'lucide-react';

interface RequestResponseViewerProps {
  request?: {
    method: string;
    url: string;
    headers?: Record<string, any>;
    body?: any;
  };
  response?: {
    status: number;
    statusText?: string;
    headers?: Record<string, any>;
    data?: any;
  };
  loading?: boolean;
  title?: string;
  description?: string;
}

export function RequestResponseViewer({
  request,
  response,
  loading = false,
  title = "HTTP Call",
  description
}: RequestResponseViewerProps) {
  const formatJson = (obj: any) => {
    if (!obj) return '';
    return JSON.stringify(obj, null, 2);
  };

  const truncateValue = (value: string, maxLength = 100) => {
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength) + '...';
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {loading && (
            <Badge variant="secondary" className="animate-pulse">
              Processing...
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Request Section */}
        {request && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400">Request</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <Server className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2 border border-border">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {request.method}
                </Badge>
                <span className="text-sm font-mono text-foreground/80">
                  {request.url}
                </span>
              </div>
              {request.headers && Object.keys(request.headers).length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold">Headers:</p>
                  <div className="bg-background/50 rounded p-2 text-xs font-mono space-y-0.5">
                    {Object.entries(request.headers).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-blue-400">{key}:</span>
                        <span className="text-foreground/70 break-all">
                          {typeof value === 'string' ? truncateValue(value, 80) : truncateValue(formatJson(value), 80)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {request.body && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold">Body:</p>
                  <pre className="bg-background/50 rounded p-2 text-xs font-mono overflow-x-auto text-foreground/70">
                    {formatJson(request.body)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Response Section */}
        {response && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Server className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Response</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2 border border-border">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={response.status >= 200 && response.status < 300 ? "default" : "destructive"}
                  className="font-mono text-xs"
                >
                  {response.status} {response.statusText || ''}
                </Badge>
              </div>
              {response.headers && Object.keys(response.headers).length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold">Headers:</p>
                  <div className="bg-background/50 rounded p-2 text-xs font-mono space-y-0.5">
                    {Object.entries(response.headers).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-green-400">{key}:</span>
                        <span className="text-foreground/70 break-all">
                          {typeof value === 'string' ? value : formatJson(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {response.data && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold">Data:</p>
                  <pre className="bg-background/50 rounded p-2 text-xs font-mono overflow-x-auto max-h-60 overflow-y-auto text-green-400/80">
                    {formatJson(response.data)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

