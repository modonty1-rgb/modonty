import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ClientEvent } from '@/src/events/client-events';
import { colors } from '@/src/theme/tokens';

const iconByCategory = { 'article-review': 'document-text-outline', 'visitor-question': 'chatbubble-ellipses-outline', 'article-revision': 'create-outline', 'media-processing': 'videocam-outline' } as const;
const accentByCategory = { 'article-review': colors.danger, 'visitor-question': colors.warning, 'article-revision': colors.primary, 'media-processing': '#A78BFA' } as const;

export function UpdateCard({ event, onOpen }: { event: ClientEvent; onOpen: () => void }) {
  const accent = accentByCategory[event.category];
  return <Pressable onPress={onOpen} style={[styles.card, event.isUnread && styles.unread]}><View style={styles.header}><View style={styles.iconWrap}><Ionicons name={iconByCategory[event.category]} size={19} color={accent} /></View><View style={styles.heading}><View style={styles.titleRow}>{event.isUnread && <View style={[styles.dot,{backgroundColor:accent}]} />}<Text style={styles.title}>{event.title}</Text></View><Text style={styles.time}>{event.occurredAt}</Text></View></View><Text style={styles.detail}>{event.detail}</Text><View style={styles.actionRow}><Text style={[styles.action,{color:accent}]}>{event.actionLabel}</Text><Ionicons name="chevron-back" size={16} color={accent} /></View></Pressable>;
}
const styles = StyleSheet.create({card:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:18,padding:15,gap:12},unread:{borderColor:'#356068',backgroundColor:'#10202C'},header:{flexDirection:'row-reverse',gap:11,alignItems:'center'},iconWrap:{width:38,height:38,borderRadius:12,backgroundColor:'#18243A',alignItems:'center',justifyContent:'center'},heading:{flex:1},titleRow:{flexDirection:'row-reverse',alignItems:'center',gap:7},dot:{width:7,height:7,borderRadius:7},title:{color:colors.text,fontSize:15,fontWeight:'800',textAlign:'right'},time:{color:colors.muted,fontSize:12,textAlign:'right',marginTop:2},detail:{color:'#D5DCEA',fontSize:13,lineHeight:21,textAlign:'right'},actionRow:{flexDirection:'row',justifyContent:'flex-start',alignItems:'center',gap:3},action:{fontSize:13,fontWeight:'800'} });
