import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
    Alert, ActivityIndicator, SafeAreaView, Platform, Modal, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import { theme } from '../../../theme/theme';
import { AuthContext } from '../../../context/AuthContext';
import { BASE_URL } from '../../../config/api';

const FACULTIES = ['All', 'Computing', 'Architecture', 'Business', 'Engineering', 'Other'];

const FACULTY_COLORS = {
    All: '#0055FE',
    'Computing': '#6366F1',
    Business: '#10B981',
    Engineering: '#F59E0B',
    Architecture: '#EC4899',
    Other: '#8B5CF6'
};

const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

const AdminResourceManagementScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [resources, setResources] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterFaculty, setFilterFaculty] = useState('All');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/resources/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResources(res.data.data || []);
        } catch (error) {
            console.error('Error fetching resources:', error);
            Alert.alert('Error', 'Could not load resources');
        } finally {
            setIsLoading(false);
        }
    };

    const executeToggle = async (id) => {
        try {
            const res = await axios.patch(`${BASE_URL}/resources/admin/${id}/toggle-ban`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Toggle successful:', res.data);
            setResources(prev => prev.map(r =>
                r._id === id ? { ...r, isBanned: !r.isBanned } : r
            ));
        } catch (error) {
            console.error('Error toggling ban:', error.response?.data || error.message);
            if (Platform.OS === 'web') {
                window.alert(`Failed to change resource status: ${error.response?.data?.message || error.message}`);
            } else {
                Alert.alert('Error', `Failed to change resource status: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    const handleToggleBan = (id, currentBanned) => {
        console.log('Ban button clicked', id, currentBanned);
        const msg = currentBanned
            ? 'Are you sure you want to make this resource public again?'
            : 'Are you sure you want to ban this resource from public view?';

        if (Platform.OS === 'web') {
            if (window.confirm(msg)) {
                executeToggle(id);
            }
            return;
        }

        Alert.alert(
            currentBanned ? 'Activate Resource' : 'Ban Resource',
            msg,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: currentBanned ? 'Activate' : 'Ban',
                    style: currentBanned ? 'default' : 'destructive',
                    onPress: () => executeToggle(id)
                }
            ]
        );
    };

    const handleOpenFile = async (fileUrl) => {
        if (!fileUrl) return;
        try {
            const serverUrl = BASE_URL.split('/api')[0];
            const fullUrl = `${serverUrl}${fileUrl}`;
            await WebBrowser.openBrowserAsync(fullUrl);
        } catch (error) {
            console.error('Error opening file:', error);
            Alert.alert('Error', 'Could not open this file.');
        }
    };

    const filtered = resources.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.author && r.author.fullName && r.author.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchFaculty = filterFaculty === 'All' || r.faculty === filterFaculty || (r.author && r.author.faculty === filterFaculty);
        return matchSearch && matchFaculty;
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.managementHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1E1B4B" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Public Resources</Text>
                    <Text style={styles.headerSub}>
                        {resources.length} resource{resources.length !== 1 ? 's' : ''} shared by students
                    </Text>
                </View>
            </View>

            <ScrollView style={styles.manageContainer} showsVerticalScrollIndicator={false}>
                {/* Search bar */}
                <View style={styles.searchWrapper}>
                    <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search resources or students…"
                        placeholderTextColor="#6B7280"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Faculty filter pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                    {FACULTIES.map(fac => {
                        const active = filterFaculty === fac;
                        const col = FACULTY_COLORS[fac] || theme.colors.primary;
                        return (
                            <TouchableOpacity
                                key={fac}
                                style={[
                                    styles.miniFilter,
                                    active && { backgroundColor: col, borderColor: col }
                                ]}
                                onPress={() => setFilterFaculty(fac)}
                            >
                                <Text style={[styles.miniFilterText, active && { color: '#FFF' }]}>{fac}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {isLoading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                ) : filtered.length > 0 ? (
                    filtered.map(resource => {
                        const facultyColor = FACULTY_COLORS[resource.faculty] || theme.colors.primary;
                        const uploaderName = resource.author ? resource.author.fullName : 'Unknown Student';
                        const isBanned = resource.isBanned;

                        return (
                            <TouchableOpacity key={resource._id} style={styles.noticeCard} activeOpacity={0.7} onPress={() => setSelectedUser(resource.author)}>
                                <View style={styles.noticeCardTop}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <View style={[styles.typeBadge, { backgroundColor: theme.colors.primary + '18' }]}>
                                            <Text style={[styles.typeBadgeText, { color: theme.colors.primary }]}>
                                                {resource.type ? resource.type.toUpperCase() : 'FILE'}
                                            </Text>
                                        </View>
                                        {resource.faculty && (
                                            <View style={[styles.facBadge, { backgroundColor: facultyColor + '18' }]}>
                                                <Text style={[styles.facBadgeText, { color: facultyColor }]}>
                                                    {resource.faculty}
                                                </Text>
                                            </View>
                                        )}
                                        {isBanned && (
                                            <View style={[styles.facBadge, { backgroundColor: '#FEF2F2' }]}>
                                                <Text style={[styles.facBadgeText, { color: '#EF4444' }]}>
                                                    BANNED
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.cardActions}>
                                        <TouchableOpacity
                                            style={[styles.miniActionBtn, { backgroundColor: '#EFF6FF', marginRight: 8 }]}
                                            onPress={() => handleOpenFile(resource.url)}
                                        >
                                            <Ionicons name="eye-outline" size={17} color="#3B82F6" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.miniActionBtn, isBanned ? { backgroundColor: '#ECFDF5' } : { backgroundColor: '#FEF2F2' }]}
                                            onPress={() => handleToggleBan(resource._id, isBanned)}
                                        >
                                            <Ionicons name={isBanned ? "checkmark-circle-outline" : "ban-outline"} size={17} color={isBanned ? "#10B981" : "#EF4444"} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <Text style={styles.noticeCardTitle} numberOfLines={2}>
                                    {resource.name}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                    <Ionicons name="person-circle-outline" size={16} color="#6B7280" style={{ marginRight: 4 }} />
                                    <Text style={styles.noticeCardDesc}>
                                        Shared by <Text style={{ fontWeight: '600', color: '#374151' }}>{uploaderName}</Text>
                                    </Text>
                                </View>

                                <View style={styles.noticeCardFooter}>
                                    <View style={styles.attachChip}>
                                        <Ionicons name="cloud-download-outline" size={12} color={theme.colors.primary} />
                                        <Text style={styles.attachChipText}>{resource.size || 'Unknown Size'}</Text>
                                    </View>
                                    <Text style={styles.timeText}>{getTimeAgo(resource.createdAt)}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <View style={styles.emptySearch}>
                        <Ionicons name="folder-open-outline" size={48} color="#E5E7EB" />
                        <Text style={styles.emptySearchText}>No public resources found</Text>
                    </View>
                )}
                <View style={{ height: 110 }} />
            </ScrollView>

            {/* User Profile Modal */}
            <Modal visible={!!selectedUser} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedUser(null)}>
                    <TouchableOpacity activeOpacity={1} style={styles.profileModal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Uploader Details</Text>
                            <TouchableOpacity onPress={() => setSelectedUser(null)}>
                                <Ionicons name="close-circle" size={26} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {selectedUser && (
                            <View style={styles.profileContent}>
                                <Image 
                                    source={{ uri: selectedUser.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop' }} 
                                    style={styles.avatarImage} 
                                />
                                <Text style={styles.profileName}>{selectedUser.fullName}</Text>
                                <View style={styles.badgeWrapper}>
                                    <View style={[styles.facBadge, { backgroundColor: '#EEF2FF', marginRight: 8 }]}>
                                        <Text style={[styles.facBadgeText, { color: '#4F46E5' }]}>{selectedUser.faculty || 'Unknown'}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailRow}>
                                    <Ionicons name="id-card-outline" size={20} color="#6B7280" style={{ width: 28 }} />
                                    <Text style={styles.detailText}>{selectedUser.studentId || 'No ID'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Ionicons name="mail-outline" size={20} color="#6B7280" style={{ width: 28 }} />
                                    <Text style={styles.detailText}>{selectedUser.email || 'No Email'}</Text>
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    managementHeader: {
        paddingTop: 60,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backBtn: { padding: 4, marginRight: 14 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#1E1B4B' },
    headerSub: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginTop: 2 },
    manageContainer: { paddingHorizontal: 20 },
    searchWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF', borderRadius: 16,
        paddingHorizontal: 16, height: 50, marginBottom: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 5, elevation: 1,
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1F2937' },
    miniFilter: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#FFF', marginRight: 8,
        borderWidth: 1.5, borderColor: '#E5E7EB',
    },
    miniFilterText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
    noticeCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 16,
        marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    },
    noticeCardTop: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 10,
    },
    typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    typeBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    facBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    facBadgeText: { fontSize: 10, fontWeight: '700' },
    cardActions: { flexDirection: 'row' },
    miniActionBtn: {
        width: 34, height: 34, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
    },
    noticeCardTitle: {
        fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 5, lineHeight: 22,
    },
    noticeCardDesc: {
        fontSize: 13, color: '#6B7280',
    },
    noticeCardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    attachChip: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    },
    attachChipText: { fontSize: 11, fontWeight: '700', color: '#0055FE', marginLeft: 4 },
    timeText: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
    emptySearch: { alignItems: 'center', marginTop: 60 },
    emptySearchText: { color: '#9CA3AF', marginTop: 12, fontSize: 15, fontWeight: '500' },

    /* Modal Styles */
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
    profileModal: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E1B4B' },
    profileContent: { alignItems: 'center' },
    avatarImage: { width: 90, height: 90, borderRadius: 45, marginBottom: 16, backgroundColor: '#F3F4F6' },
    profileName: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8 },
    badgeWrapper: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
    detailRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', backgroundColor: '#F9FAFB', padding: 14, borderRadius: 12, marginBottom: 10 },
    detailText: { fontSize: 15, fontWeight: '600', color: '#4B5563' }
});

export default AdminResourceManagementScreen;
