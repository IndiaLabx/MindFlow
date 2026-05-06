const fs = require('fs');

// Patch SettingsPage
let settingsPath = 'src/features/auth/components/SettingsPage.tsx';
let settingsContent = fs.readFileSync(settingsPath, 'utf8');

if (!settingsContent.includes("const [profile, setProfile] = useState")) {
  settingsContent = settingsContent.replace(
    "const { user, refreshUser } = useAuth();",
    `const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setProfileLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
      setProfileLoading(false);
    };

    fetchProfile();
  }, [user]);`
  );

  settingsContent = settingsContent.replace(
    `const updateMetadata = async (key: string, value: string, successMessage: string) => {
    if (!user) return;
    const { error } = await supabase.auth.updateUser({
      data: { [key]: value }
    });

    if (error) {
      showMessage(error.message, true);
    } else {
      showMessage(successMessage);
      refreshUser();
    }
  };`,
    `const updateMetadata = async (key: string, value: string, successMessage: string) => {
    if (!user) return;

    // Also update auth.users metadata for legacy compatibility just in case
    await supabase.auth.updateUser({
      data: { [key]: value }
    });

    // Update the profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ [key]: value })
      .eq('id', user.id);

    if (error) {
      showMessage(error.message, true);
    } else {
      showMessage(successMessage);
      // Update local state
      setProfile((prev: any) => ({ ...prev, [key]: value }));
      refreshUser();
    }
  };`
  );

  settingsContent = settingsContent.replace(/user\?\.user_metadata\?\.full_name/g, 'profile?.full_name || user?.user_metadata?.full_name');
  settingsContent = settingsContent.replace(/user\?\.user_metadata\?\.bio/g, 'profile?.bio || user?.user_metadata?.bio');
  settingsContent = settingsContent.replace(/user\?\.user_metadata\?\.target_exam/g, 'profile?.target_exam || user?.user_metadata?.target_exam');
  settingsContent = settingsContent.replace(/user\?\.user_metadata\?\.phone/g, 'profile?.phone || user?.user_metadata?.phone');
  settingsContent = settingsContent.replace(/user\?\.user_metadata\?\.dob/g, 'profile?.dob || user?.user_metadata?.dob');

  if (!settingsContent.includes("import { supabase }")) {
    settingsContent = "import { supabase } from '../../../lib/supabase';\n" + settingsContent;
  }

  fs.writeFileSync(settingsPath, settingsContent);
}

// Patch ProfilePage
let profilePath = 'src/features/auth/components/ProfilePage.tsx';
let profileContent = fs.readFileSync(profilePath, 'utf8');

if (!profileContent.includes("const [profile, setProfile] = useState")) {
  profileContent = profileContent.replace(
    "const { user, signOut, refreshUser } = useAuth();",
    `const { user, signOut, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfile(data);
      }
    };
    fetchProfile();
  }, [user]);`
  );

  profileContent = profileContent.replace(/user\?\.user_metadata\?\.avatar_url/g, "profile?.avatar_url || user?.user_metadata?.avatar_url");
  profileContent = profileContent.replace(/user\?\.user_metadata\?\.target_exam/g, "profile?.target_exam || user?.user_metadata?.target_exam");
  profileContent = profileContent.replace(/user\?\.user_metadata\?\.full_name/g, "profile?.full_name || user?.user_metadata?.full_name");

  if (!profileContent.includes("import { supabase }")) {
    profileContent = "import { supabase } from '../../../lib/supabase';\n" + profileContent;
  }

  if (!profileContent.includes("useEffect } from 'react'")) {
    profileContent = profileContent.replace(
      "import React, { useState, useRef, useCallback } from 'react';",
      "import React, { useState, useRef, useCallback, useEffect } from 'react';"
    );
  }

  fs.writeFileSync(profilePath, profileContent);
}
