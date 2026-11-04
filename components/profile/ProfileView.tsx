'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  UserIcon,
  CameraIcon,
  TrashIcon,
  ShieldCheckIcon,
  KeyIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';

export function ProfileView() {
  const { theme, isDarkMode } = useThemeContext();
  const {
    currentUser,
    onUpdateCurrentUser,
    onChangePassword,
    toast,
  } = useCRM();

  // Name state
  const [name, setName] = useState(currentUser.name);
  const [isSavingName, setIsSavingName] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSavingPass, setIsSavingPass] = useState(false);

  // File input ref for avatar
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Change detection for Name save button
  const isNameChanged = useMemo(() => {
    return name.trim().length > 0 && name.trim() !== currentUser.name;
  }, [name, currentUser.name]);

  // Validation & Change detection for Password button
  const canUpdatePassword = useMemo(() => {
    return (
      currentPassword.trim().length > 0 &&
      newPassword.length >= 6 &&
      newPassword === confirmPassword
    );
  }, [currentPassword, newPassword, confirmPassword]);

  // Avatar upload handler
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, or WEBP)');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image size must be less than 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUpdateCurrentUser({ avatarUrl: dataUrl });
      toast.success('Profile image updated');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    onUpdateCurrentUser({ avatarUrl: undefined });
    toast.info('Profile image removed');
  };

  // Name save
  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNameChanged) return;

    setIsSavingName(true);
    setTimeout(() => {
      onUpdateCurrentUser({ name: name.trim() });
      setIsSavingName(false);
      toast.success('Name updated successfully');
    }, 250);
  };

  // Password save
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdatePassword) return;

    setIsSavingPass(true);
    setTimeout(() => {
      const res = onChangePassword(currentPassword, newPassword);
      setIsSavingPass(false);
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    }, 300);
  };

  const initials = currentUser.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-border/40">
        <h1 className={`text-xl font-bold tracking-tight ${theme.textMain}`}>
          Profile
        </h1>
        <p className={`text-xs ${theme.textMuted} mt-0.5`}>
          Manage your account profile and password.
        </p>
      </div>

      {/* Account Info Card */}
      <div className={`${theme.bgPanel} rounded-2xl border ${theme.border} p-5 sm:p-6 shadow-xs space-y-6`}>
        {/* Avatar Section */}
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/20 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-primary to-primary/80 flex items-center justify-center text-white text-xl font-bold ring-2 ring-primary/20 shadow-sm">
                {initials}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload photo"
              className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-white rounded-full shadow-md hover:scale-105 active:scale-95 transition-transform"
            >
              <CameraIcon className="w-3.5 h-3.5" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFile}
            />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-base font-semibold ${theme.textMain} truncate`}>
                {currentUser.name}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                <ShieldCheckIcon className="w-3 h-3" />
                {currentUser.role}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <EnvelopeIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono text-[11px] truncate">{currentUser.email}</span>
            </div>

            {currentUser.avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="inline-flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 pt-1"
              >
                <TrashIcon className="w-3 h-3" />
                Remove photo
              </button>
            )}
          </div>
        </div>

        {/* Change Name Form */}
        <form onSubmit={handleSaveName} className="space-y-4 pt-4 border-t border-border/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name Input */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-medium ${theme.textMuted}`}>
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className={`w-full text-xs pl-9 pr-3 py-2 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary transition-colors`}
                />
              </div>
            </div>

            {/* Email (Read-Only) */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-medium ${theme.textMuted}`}>
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <div className={`w-full text-xs pl-9 pr-3 py-2 rounded-xl border ${theme.border} bg-slate-100/70 dark:bg-slate-900/50 ${theme.textMuted} font-mono select-none truncate`}>
                  {currentUser.email}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={!isNameChanged || isSavingName}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isNameChanged && !isSavingName
                  ? 'bg-primary hover:bg-primary/90 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-border/40'
              }`}
            >
              <CheckIcon className="w-3.5 h-3.5" />
              {isSavingName ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className={`${theme.bgPanel} rounded-2xl border ${theme.border} p-5 sm:p-6 shadow-xs space-y-4`}>
        <div className="flex items-center gap-2 pb-3 border-b border-border/40">
          <KeyIcon className="w-4 h-4 text-primary" />
          <h2 className={`text-sm font-semibold ${theme.textMain}`}>
            Change Password
          </h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1.5 max-w-md">
            <label className={`block text-xs font-medium ${theme.textMuted}`}>
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className={`w-full text-xs pr-9 pl-3 py-2 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-medium ${theme.textMuted}`}>
                New Password (min 6 characters)
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className={`w-full text-xs pr-9 pl-3 py-2 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-medium ${theme.textMuted}`}>
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className={`w-full text-xs pr-9 pl-3 py-2 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-[11px] text-rose-500">
              Passwords do not match
            </p>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={!canUpdatePassword || isSavingPass}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                canUpdatePassword && !isSavingPass
                  ? 'bg-primary hover:bg-primary/90 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-border/40'
              }`}
            >
              <KeyIcon className="w-3.5 h-3.5" />
              {isSavingPass ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
