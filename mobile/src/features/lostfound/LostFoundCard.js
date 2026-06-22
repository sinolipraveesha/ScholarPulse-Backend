import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

const STATUS_CONFIG = {
    active: { label: 'Active', color: '#F59E0B', bg: '#FEF3C7', icon: 'ellipse' },
    claimed: { label: 'Claimed', color: '#3B82F6', bg: '#DBEAFE', icon: 'checkmark-circle' },
    resolved: { label: 'Resolved', color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-done-circle' },
};

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?q=80&w=400&auto=format&fit=crop';

export default function LostFoundCard({ item, onContact }) {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.active;
    const isLost = item.type === 'lost';
    const accentColor = isLost ? theme.colors.primary : '#059669';

    return (
        <View style={styles.card}>
            {/* Accent line at top */}
            <View style={[styles.accentLine, { backgroundColor: accentColor }]} />

            {/* Item Image */}
            <Image 
                source={{ uri: item.image || PLACEHOLDER_IMAGE }} 
                style={styles.cardImage} 
                defaultSource={{ uri: PLACEHOLDER_IMAGE }}
            />
            
            {/* Card Content */}
            <View style={styles.cardContent}>
                {/* Tags Row: Type + Status */}
                <View style={styles.tagsRow}>
                    <View style={[styles.tagBadge, { backgroundColor: isLost ? '#FFE8E8' : '#E6F8F0' }]}>
                        <Ionicons 
                            name={isLost ? 'alert-circle' : 'checkmark-circle'} 
                            size={12} 
                            color={isLost ? '#FF5252' : '#059669'} 
                            style={{ marginRight: 4 }}
                        />
                        <Text style={[styles.tagText, { color: isLost ? '#FF5252' : '#059669' }]}>
                            {isLost ? 'LOST' : 'FOUND'}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Ionicons name={status.icon} size={10} color={status.color} style={{ marginRight: 3 }} />
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.description ? (
                    <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                ) : null}

                {/* Info Grid */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoIconWrap}>
                            <Ionicons name="calendar-outline" size={14} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.infoText}>{item.date}</Text>
                    </View>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoRow}>
                        <View style={styles.infoIconWrap}>
                            <Ionicons name="location-outline" size={14} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.infoText}>{item.location}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                    <View style={styles.reporterInfo}>
                        <Image 
                            source={{ uri: item.reporter?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.reporter?.fullName || 'User') + '&background=E0E7FF&color=4F46E5&size=84' }} 
                            style={styles.profileAvatar} 
                        />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.reporterLabel}>Reported by</Text>
                            <Text style={styles.reporterName}>{item.reporter?.fullName || 'Unknown User'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={[styles.contactBtn, { backgroundColor: accentColor }]}
                        onPress={() => onContact(item.phoneNumber)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="call-outline" size={16} color={theme.colors.white} />
                        <Text style={styles.contactBtnText}>Contact</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 14,
        shadowColor: "#1E1B4B",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
        elevation: 5,
        overflow: 'hidden',
    },
    accentLine: {
        height: 3,
        width: '100%',
    },
    cardImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#F3F4FE',
        resizeMode: 'cover',
    },
    cardContent: {
        padding: 18,
    },
    tagsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8,
    },
    tagBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    cardTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: theme.colors.textMain,
        marginBottom: 6,
        lineHeight: 25,
    },
    cardDesc: {
        fontSize: 13,
        color: theme.colors.textSub,
        lineHeight: 20,
        marginBottom: 14,
    },
    infoGrid: {
        backgroundColor: '#F8F9FE',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    infoIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    infoDivider: {
        height: 1,
        backgroundColor: '#E8E9F0',
        marginVertical: 4,
        marginLeft: 38,
    },
    infoText: {
        fontSize: 13,
        color: theme.colors.textMain,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F1F8',
        paddingTop: 14,
    },
    reporterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileAvatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#EBECEF',
    },
    reporterLabel: {
        fontSize: 9,
        color: theme.colors.textSub,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    reporterName: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.textMain,
        marginTop: 1,
    },
    contactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        marginLeft: 10,
    },
    contactBtnText: {
        color: theme.colors.white,
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 5,
    },
});
