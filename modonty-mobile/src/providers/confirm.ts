import { Alert } from 'react-native';

/** تأكيد صريح يسمّي ما سيحدث — الفعل المدمّر ليس بنقرة واحدة (UIUX §١). */
export function confirm(title: string, body: string, actionLabel: string): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(title, body, [
      { text: 'تراجع', style: 'cancel', onPress: () => resolve(false) },
      { text: actionLabel, style: 'destructive', onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
}
