import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Key, Lock, Shield, Copy, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { IdentityData } from 'zwt-access-lib';

interface IdentityCardProps {
  identity: IdentityData;
  onClear?: () => void;
}

export function IdentityCard({ identity, onClear }: IdentityCardProps) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const truncate = (str: string, length = 20) => {
    if (str.length <= length) return str;
    return `${str.substring(0, length)}...${str.substring(str.length - 10)}`;
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-card to-card/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl">Tu Identidad ZK</CardTitle>
          </div>
          <Badge variant="default" className="gap-1">
            <Lock className="w-3 h-3" />
            Activa
          </Badge>
        </div>
        <CardDescription>
          Identidad anónima basada en Semaphore Protocol
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Private Key */}
        <div className="space-y-2 p-3 bg-secondary/50 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Private Key</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
              >
                {showPrivateKey ? (
                  <EyeOff className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(identity.privateKey, 'privateKey')}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <p className="font-mono text-xs break-all text-muted-foreground">
            {showPrivateKey ? identity.privateKey : '••••••••••••••••••••••••••••••••'}
          </p>
          {copied === 'privateKey' && (
            <p className="text-xs text-green-400">✓ Copiado</p>
          )}
          <p className="text-xs text-destructive/70">
            Mantén esto en secreto. Es tu identidad anónima.
          </p>
        </div>

        {/* Public Key */}
        <div className="space-y-2 p-3 bg-secondary/50 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">Public Key</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => copyToClipboard(identity.publicKey, 'publicKey')}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <p className="font-mono text-xs break-all text-muted-foreground">
            {truncate(identity.publicKey, 30)}
          </p>
          {copied === 'publicKey' && (
            <p className="text-xs text-green-400">✓ Copiado</p>
          )}
        </div>

        {/* Commitment */}
        <div className="space-y-2 p-3 bg-secondary/50 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Commitment (ID Público)</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => copyToClipboard(identity.commitment, 'commitment')}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <p className="font-mono text-xs break-all text-muted-foreground">
            {truncate(identity.commitment, 30)}
          </p>
          {copied === 'commitment' && (
            <p className="text-xs text-green-400">✓ Copiado</p>
          )}
          <p className="text-xs text-muted-foreground">
            Este es tu identificador público registrado en el grupo.
          </p>
        </div>

        {/* Actions */}
        {onClear && (
          <div className="pt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              Borrar Identidad
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

