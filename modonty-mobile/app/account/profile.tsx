import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { fieldErrors } from '@/lib/field-errors';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { meApi } from '@/services/api-actions';
import { ApiError, toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

/** S25 — الملف الشخصي (A9 updateProfile · A10 الصورة ≤٤ ميجا كما الويب). */
export default function ProfileScreen() {
  const { user, refreshMe } = useAuth();
  const { colors } = useAppTheme();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [image, setImage] = useState<string | null>(user?.image ?? null);
  const [busy, setBusy] = useState<'save' | 'avatar' | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const errors = fieldErrors(error);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setBio(user.bio ?? '');
    setImage(user.image);
  }, [user]);

  const pick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.show('اسمح بالوصول إلى الصور لتغيير صورتك.', 'error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    const asset = result.canceled ? null : result.assets[0];
    if (!asset) return;
    setBusy('avatar');
    try {
      const r = await meApi.avatar({ uri: asset.uri, name: asset.fileName ?? 'avatar.jpg', type: asset.mimeType ?? 'image/jpeg' });
      setImage(r.url);
      await meApi.update({ name: name.trim(), bio: bio.trim(), image: r.url });
      await refreshMe();
      toast.show('تغيّرت صورتك', 'success');
    } catch (e) {
      toast.show(toApiError(e).message, 'error');
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    setBusy('save');
    setError(null);
    try {
      await meApi.update({ name: name.trim(), bio: bio.trim(), image });
      await refreshMe();
      toast.show('حُفظ ملفّك', 'success');
      router.back();
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen>
      <Header back title="الملف الشخصي" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarRow}>
          {image ? (
            <Image source={image} style={styles.avatar} contentFit="cover" accessibilityLabel="صورتك" />
          ) : (
            <View style={[styles.avatar, styles.center, { backgroundColor: colors.primaryContainer }]}>
              <Icon name="profile" tone="onPrimaryContainer" />
            </View>
          )}
          <Button label="تغيير الصورة" kind="outlined" icon="gallery" compact onPress={() => void pick()} busy={busy === 'avatar'} busyLabel="تُرفع الصورة…" />
        </View>
        <TextField label="الاسم" value={name} onChangeText={setName} error={errors.name} />
        <TextField label="نبذة عنك" value={bio} onChangeText={setBio} multiline error={errors.bio} />
        {user?.email ? (
          <AppText variant="secondary" tone="muted">
            {`البريد: ${user.email} — لا يُغيَّر من هنا.`}
          </AppText>
        ) : null}
        {error && Object.keys(errors).length === 0 ? (
          <AppText variant="label" tone="danger">
            {error.message}
          </AppText>
        ) : null}
        <Button label="حفظ" onPress={() => void save()} busy={busy === 'save'} busyLabel="يُحفظ…" disabled={busy !== null} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.screen, gap: space.md },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: { width: control.avatarLarge, height: control.avatarLarge, borderRadius: radius.pill },
  center: { alignItems: 'center', justifyContent: 'center' },
});
