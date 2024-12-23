import { toast } from '@zerodevx/svelte-toast';

export function success(message: string) {
    toast.push(message, {
        theme: {
            '--toastProgressBackground': 'green',
        }
    });
}