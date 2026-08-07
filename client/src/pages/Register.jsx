import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { AuthLayout } from '../layouts/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { User, Mail, Lock, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'psychologist']).default('user'),
});

export const Register = () => {
  const { register: registerAuth, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'user' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    const res = await registerAuth(data);
    if (res.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(res.message || 'Registration failed');
    }
  };

  return (
    <AuthLayout title="Register Account" subtitle="Join MindBridge AI to track your mental wellness">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Jane Doe"
          icon={User}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Role Toggle Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setValue('role', 'user')}
              className={`p-2.5 rounded-xl text-xs font-black uppercase border-2 flex items-center justify-center space-x-2 transition-all ${
                selectedRole === 'user'
                  ? 'bg-[#B82126] text-white border-black polo-shadow-sm'
                  : 'bg-white text-black border-neutral-300'
              }`}
            >
              <User className="w-4 h-4" />
              <span>User</span>
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'psychologist')}
              className={`p-2.5 rounded-xl text-xs font-black uppercase border-2 flex items-center justify-center space-x-2 transition-all ${
                selectedRole === 'psychologist'
                  ? 'bg-[#B82126] text-white border-black polo-shadow-sm'
                  : 'bg-white text-black border-neutral-300'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Psychologist</span>
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <div className="text-center pt-4 border-t-2 border-neutral-200">
        <p className="text-xs font-bold text-neutral-600">
          Already have an account?{' '}
          <Link to="/login" className="text-[#B82126] hover:underline font-black">
            Sign In Here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
