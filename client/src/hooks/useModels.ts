import { useEffect, useState } from 'react';
import type { ModelType } from '@/types/chat';

interface ModelResponse {
  models: ModelType[];
}

export const useModels = () => {
  const [models, setModels] = useState<ModelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/models');
        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }
        const data: ModelResponse = await response.json();
        setModels(data.models);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Fallback to hardcoded models if API fails
        setModels([
          'claude-3-5-sonnet-latest',
          'claude-3-7-sonnet',
          'claude-4-sonnet',
          'stable-image-ultra',
        ]);
      } finally {
        setLoading(false);
      }
    };

    void fetchModels();
  }, []);

  return { models, loading, error };
};
