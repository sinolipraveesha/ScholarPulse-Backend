import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

const STATUS_CONFIG = {
    active: { label: 'Active', color: '#F59E0B', bg: '#FEF3C7', icon: 'ellipse' },
    claimed: { label: 'Claimed', color: '#3B82F6', bg: '#DBEAFE', icon: 'checkmark-circle' },
    resolved: { label: 'Resolved', color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-done-circle' },
};

const STATUS_ORDER = ['active', 'claimed', 'resolved'];

export default function HistoryModal({
    visible,
    onClose,
    myItems,
    onEdit,
    onDelete,
    onStatusChange,
    currentUser,
}) {
    const [expandedStatusId, setExpandedStatusId] = useState(null);

    const handleStatusPress = (itemId, isOwner) => {
        if (!isOwner) return;
        setExpandedStatusId(expandedStatusId === itemId ? null : itemId);
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.historyModalOverlay}>
                <View style={styles.historyModalContainer}>
                    <View style={styles.historyDragHandle} />
                    
                    <View style={styles.historyModalHeader}>
                        <View>
                            <Text style={styles.historyModalTitle}>My Post History</Text>
                            <Text style={styles.historyModalSub}>{myItems.length} items posted</Text>
                        </View>
                        <TouchableOpacity style={styles.historyCloseBtn} onPress={onClose}>
                            <Ionicons name="close" size={20} color={theme.colors.textSub} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.historyScrollContent}>
                        {myItems.length === 0 ? (
                            <View style={styles.historyEmpty}>
                                <Ionicons name="time-outline" size={48} color={theme.colors.border} />
                                <Text style={styles.historyEmptyText}>No history yet.</Text>
                            </View>
                        ) : (
                            myItems.map(item => {
                                const status = item.status || 'active';
                                const currentConfig = STATUS_CONFIG[status] || STATUS_CONFIG.active;
                                const isExpanded = expandedStatusId === item._id;
                                const isOwner = item.reporter?._id === currentUser?._id;

                                return (
                                    <View key={item._id} style={styles.historyCardWrapper}>
                                        <View style={styles.historyCardMain}>
                                            <Image 
                                                source={{ uri: item.image || 'https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=400&auto=format&fit=crop' }} 
                                                style={styles.historyListImg} 
                                            />
                                            <View style={styles.historyListContent}>
                                                <View style={styles.historyTypeRow}>
                                                    <View style={[styles.historyTypeBadge, { backgroundColor: item.type === 'lost' ? '#FEF2F2' : '#ECFDF5' }]}>
                                                        <Text style={[styles.historyTypeText, { color: item.type === 'lost' ? '#EF4444' : '#10B981' }]}>
                                                            {item.type.toUpperCase()}
                                                        </Text>
                                                    </View>
                                                    {/* Status Badge */}
                                                    <TouchableOpacity 
                                                        style={[styles.statusBadge, { backgroundColor: currentConfig.bg }]}
                                                        onPress={() => handleStatusPress(item._id, isOwner)}
                                                        activeOpacity={isOwner ? 0.7 : 1}
                                                    >
                                                        <Ionicons name={currentConfig.icon} size={10} color={currentConfig.color} style={{ marginRight: 4 }} />
                                                        <Text style={[styles.statusBadgeText, { color: currentConfig.color }]}>{currentConfig.label}</Text>
                                                        {isOwner && <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={12} color={currentConfig.color} style={{ marginLeft: 2 }} />}
                                                    </TouchableOpacity>
                                                </View>
                                                <Text style={styles.historyListTitle} numberOfLines={1}>{item.title}</Text>
                                                <View style={styles.historyMeta}>
                                                    <Ionicons name="calendar-outline" size={12} color={theme.colors.textSub} />
                                                    <Text style={styles.historyListSub}>{item.date}</Text>
                                                    <Ionicons name="location-outline" size={12} color={theme.colors.textSub} style={{ marginLeft: 8 }} />
                                                    <Text style={styles.historyListSub} numberOfLines={1}>{item.location}</Text>
                                                </View>
                                            </View>
                                            {/* Action Buttons */}
                                            <View style={styles.historyActions}>
                                                {isOwner && (
                                                    <TouchableOpacity 
                                                        style={styles.historyActionBtnEdit}
                                                        onPress={() => onEdit(item)}
                                                    >
                                                        <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                                                    </TouchableOpacity>
                                                )}
                                                <TouchableOpacity 
                                                    style={styles.historyActionBtnDelete}
                                                    onPress={() => onDelete(item._id)}
                                                >
                                                    <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {/* Expanded Status Selector */}
                                        {isExpanded && isOwner && (
                                            <View style={styles.statusSelector}>
                                                <Text style={styles.statusSelectorLabel}>CHANGE STATUS</Text>
                                                <View style={styles.statusSelectorRow}>
                                                    {STATUS_ORDER.map((s) => {
                                                        const cfg = STATUS_CONFIG[s];
                                                        const isActive = (item.status || 'active') === s;
                                                        return (
                                                            <TouchableOpacity
                                                                key={s}
                                                                style={[
                                                                    styles.statusOption,
                                                                    { backgroundColor: isActive ? cfg.bg : '#F3F4F6', borderColor: isActive ? cfg.color : 'transparent' }
                                                                ]}
                                                                onPress={() => {
                                                                    if (onStatusChange) {
                                                                        onStatusChange(item._id, s);
                                                                    }
                                                                    setExpandedStatusId(null);
                                                                }}
                                                            >
                                                                <Ionicons name={cfg.icon} size={14} color={isActive ? cfg.color : '#9CA3AF'} style={{ marginRight: 6 }} />
                                                                <Text style={[styles.statusOptionText, { color: isActive ? cfg.color : '#6B7280' }]}>{cfg.label}</Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    historyModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    historyModalContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, height: '82%' },
    historyDragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16 },
    historyModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingHorizontal: 4 },
    historyModalTitle: { fontSize: 22, fontWeight: '900', color: '#1E1B4B' },
    historyModalSub: { fontSize: 13, fontWeight: '600', color: theme.colors.textSub, marginTop: 2 },
    historyCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    
    historyScrollContent: { paddingBottom: 30 },
    historyEmpty: { paddingVertical: 50, alignItems: 'center' },
    historyEmptyText: { color: theme.colors.textSub, fontSize: 14, fontWeight: '500', textAlign: 'center', marginTop: 16 },
    
    historyCardWrapper: { backgroundColor: '#F8F9FE', borderRadius: 16, marginBottom: 10, marginHorizontal: 4, overflow: 'hidden' },
    historyCardMain: { flexDirection: 'row', padding: 12, alignItems: 'center' },
    historyListImg: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#E0E7FF' },
    historyListContent: { flex: 1, marginLeft: 12 },
    
    historyTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    historyTypeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
    historyTypeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
    
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, gap: 3 },
    statusBadgeText: { fontSize: 9, fontWeight: '800' },
    
    historyListTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.textMain },
    historyMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
    historyListSub: { fontSize: 11, color: theme.colors.textSub, fontWeight: '500', marginLeft: 3 },
    
    historyActions: { flexDirection: 'column', alignItems: 'center', gap: 6, marginLeft: 8 },
    historyActionBtnEdit: { width: 32, height: 32, borderRadius: 10, backgroundColor: theme.colors.white, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
    historyActionBtnDelete: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FFF1F2', justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
    
    statusSelector: { backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#E8E9F0' },
    statusSelectorLabel: { fontSize: 9, fontWeight: '800', color: theme.colors.textSub, letterSpacing: 1, marginBottom: 8 },
    statusSelectorRow: { flexDirection: 'row', gap: 8 },
    statusOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 10, gap: 5, borderWidth: 1.5 },
    statusOptionText: { fontSize: 11, fontWeight: '700' },
});
