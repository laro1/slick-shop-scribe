
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SecuritySettingsProps {
  sessionTimeout: number;
  onSetSessionTimeout: (minutes: number) => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ sessionTimeout, onSetSessionTimeout }) => {
  const [timeout, setTimeoutValue] = useState(sessionTimeout.toString());

  const handleSetTimeout = () => {
    const newTimeout = parseInt(timeout, 10);
    if (!isNaN(newTimeout) && newTimeout > 0) {
      onSetSessionTimeout(newTimeout);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Acceso y Seguridad</CardTitle>
        <CardDescription>
          Configura opciones de seguridad para las sesiones de los usuarios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <h3 className="text-lg font-medium">Expiración de Sesión</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Define el tiempo de inactividad en minutos antes de que la sesión de un usuario se cierre automáticamente.
          </p>
          <div className="flex w-full max-w-sm items-center space-x-2">
             <Input
              id="session-timeout"
              type="number"
              placeholder="Ej: 30"
              value={timeout}
              onChange={(e) => setTimeoutValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSetTimeout()}
              min="1"
            />
            <Button onClick={handleSetTimeout}>Guardar</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
