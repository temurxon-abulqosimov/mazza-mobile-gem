import { useMutation, useQueryClient } from '@tanstack/react-query';
import { followStore, unfollowStore } from '../api/stores';
import { ApiResponse } from '../domain/Common';

export const useFollowStore = () => {
    const queryClient = useQueryClient();

    const followMutation = useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (storeId) => followStore(storeId),
        onSuccess: (_, storeId) => {
            queryClient.invalidateQueries({ queryKey: ['store', storeId] });
            queryClient.invalidateQueries({ queryKey: ['user', 'followed-stores'] });
        },
        onError: (error) => {
            console.error('Follow mutation failed:', error);
        }
    });

    const unfollowMutation = useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (storeId) => unfollowStore(storeId),
        onSuccess: (_, storeId) => {
            queryClient.invalidateQueries({ queryKey: ['store', storeId] });
            queryClient.invalidateQueries({ queryKey: ['user', 'followed-stores'] });
        },
        onError: (error) => {
            console.error('Unfollow mutation failed:', error);
        }
    });

    return {
        follow: followMutation.mutate,
        unfollow: unfollowMutation.mutate,
        isFollowingLoading: followMutation.isPending || unfollowMutation.isPending,
        followError: followMutation.error,
        unfollowError: unfollowMutation.error,
    };
};
