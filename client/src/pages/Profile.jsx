import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/useAuthStore';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { User, Mail, Shield, Image } from 'lucide-react';
import { toast } from 'sonner';

export const Profile = () => {
  const { user, updateProfile, isLoading } = useAuthStore();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
    },
  });

  const onSubmit = async (data) => {
    const res = await updateProfile(data);
    if (res.success) {
      toast.success('Profile updated successfully');
    } else {
      toast.error(res.message || 'Profile update failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black uppercase text-black">User Profile</h1>
          <p className="text-xs font-bold text-neutral-600">Manage your personal information and bio</p>
        </div>

        <Card className="space-y-6">
          <div className="flex items-center space-x-4 pb-6 border-b-2 border-neutral-200">
            <Avatar src={user?.avatar} name={user?.name} size="xl" />
            <div>
              <h3 className="text-xl font-black text-black">{user?.name}</h3>
              <p className="text-xs text-neutral-500 font-semibold">{user?.email}</p>
              <span className="inline-block mt-2 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-[#9F1239] text-white polo-border">
                Role: {user?.role || 'user'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full Name" icon={User} {...register('name')} />
            <Input label="Avatar Image URL" icon={Image} placeholder="https://..." {...register('avatar')} />
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                Personal Bio
              </label>
              <textarea
                className="w-full bg-white text-black p-3 text-sm rounded-xl polo-border focus:shadow-[4px_4px_0px_0px_#9F1239] focus:outline-none min-h-[100px]"
                placeholder="Share a brief bio..."
                {...register('bio')}
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Save Profile Changes
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};
