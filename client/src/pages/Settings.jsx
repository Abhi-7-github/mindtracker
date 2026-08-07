import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Lock, KeyRound } from 'lucide-react';
import * as authService from '../services/authService';
import { toast } from 'sonner';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const Settings = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await authService.changePassword(data);
      if (res.success) {
        toast.success('Password changed successfully');
        reset();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black uppercase text-black">Account Settings</h1>
          <p className="text-xs font-bold text-neutral-600">Update security preferences and password</p>
        </div>

        <Card className="space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b-2 border-neutral-200">
            <KeyRound className="w-5 h-5 text-[#B82126]" />
            <h3 className="text-lg font-black uppercase text-black">Change Security Password</h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              icon={Lock}
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />

            <Input
              label="New Password"
              type="password"
              icon={Lock}
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};
