import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE = '/api/v1/fitness/suggest-swap';

export const suggestSwap = async (blockType: string) => {
    // [GUARDRAIL 1: Graceful Degradation]
    // Strict 4.5s timeout as per CTO request
    const { data } = await axios.post(
        API_BASE,
        { block_type: blockType },
        { timeout: 4500 }
    );
    return data;
};

export const useSuggestSwap = () => {
    return useMutation({
        mutationFn: suggestSwap,
        onError: (error) => {
            console.error('Swap Engine Error:', error);
            toast.error("La IA está saturada. Por favor, selecciona el ejercicio manualmente.", {
                id: 'swap-error',
                icon: '⚠️',
                duration: 4000
            });
        }
    });
};
