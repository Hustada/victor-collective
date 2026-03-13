import { useEffect, useCallback } from 'react';
import emailjs from '@emailjs/browser';

export function useEmailJS() {
  useEffect(() => {
    emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '');
  }, []);

  const send = useCallback(
    (templateId: string, templateParams: Record<string, unknown>) =>
      emailjs.send(process.env.REACT_APP_EMAILJS_SERVICE_ID || '', templateId, templateParams),
    []
  );

  return { send };
}
