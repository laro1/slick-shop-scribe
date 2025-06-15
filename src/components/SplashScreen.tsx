
import React from 'react';
import { useTranslation } from 'react-i18next';

const SplashScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-center p-4">
      <img src="/lovable-uploads/fe387e2a-0929-4096-a78a-aa2d87ec3cbe.png" alt="Logo" className="w-24 h-24 mb-6 animate-pulse" />
      <h1 className="text-3xl font-bold tracking-tight text-primary">
        BDsale
      </h1>
      <p className="text-muted-foreground mt-2">{t('loading_data')}</p>
    </div>
  );
};

export default SplashScreen;
